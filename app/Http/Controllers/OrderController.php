<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Product; // 剛才提醒要補上的
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // 🌟 補上這行，明確引入 Log
use Illuminate\Support\Str;
use Inertia\Inertia; // 記得引入 Inertia


class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_email' => 'required|email|max:255',
            'recipient_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string|max:255',
        ]);

        $userId = Auth::id();

        // ==========================================
        // 🌟 核心優化：無感儲存會員預設聯絡資訊
        // ==========================================
        $user = Auth::user();
        // 🌟 解法：加入這行 PHP 原生斷言
        // 這是一段實際的程式碼，清洗檔絕對不會動它！
        // 而且 VS Code (Intelephense) 看到這行後，就會立刻知道 $user 是 User 模型
        assert($user instanceof User);

        if ($user) {
            $updateData = [];

            // ... 你的 updateData 邏輯

            if (!empty($updateData)) {
                $user->update($updateData); // 紅線完美消失！
            }
        }
        if ($user) {
            $updateData = [];

            // 若會員欄位為空，將這次填寫的資料作為未來的預設值
            if (empty($user->phone) && $request->filled('recipient_phone')) {
                $updateData['phone'] = $request->recipient_phone;
            }

            if (empty($user->address) && $request->filled('shipping_address')) {
                $updateData['address'] = $request->shipping_address;
            }

            // 只有在需要更新時才執行資料庫寫入，節省效能
            if (!empty($updateData)) {
                // 因為我們前一步已經將 phone 與 address 加入 User Model 的 $fillable，這裡可以直接 update
                $user->update($updateData);
            }
        }
        // ==========================================

        $cartItems = CartItem::with(['product'])
            ->where('user_id', $userId)
            ->get();

        if ($cartItems->isEmpty()) {
            return $this->sendError('購物車是空的，無法結帳', 400);
        }

        $totalAmount = $cartItems->reduce(function ($total, $item) {
            return $total + ($item->product->price * $item->quantity);
        }, 0);

        // 開啟資料庫交易
        DB::beginTransaction();

        try {
            // ==========================================
            // 📦 業界標準：悲觀鎖 (Pessimistic Locking) 庫存扣除
            // ==========================================
            foreach ($cartItems as $item) {
                // ⚠️ 關鍵防護：在 Transaction 內重新查詢商品，並加上 lockForUpdate()
                // 這會鎖定該筆商品資料列，直到 Commit 或 RollBack 後才釋放，確保其他結帳請求排隊等待
                $product = Product::where('id', $item->product_id)
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    throw new \Exception("商品「{$item->product->name}」已下架或不存在。");
                }

                // 檢查鎖定後的最新庫存
                if ($product->stock < $item->quantity) {
                    throw new \Exception("抱歉，商品「{$product->name}」庫存不足，僅剩 {$product->stock} 件。");
                }

                // 扣除庫存
                $product->decrement('stock', $item->quantity);
            }

            // ==========================================
            // 📝 訂單建立邏輯
            // ==========================================
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => $userId,
                'total_amount' => $totalAmount,
                'recipient_name' => $validated['recipient_name'],
                'recipient_email' => $validated['recipient_email'],
                'recipient_phone' => $validated['recipient_phone'],
                'shipping_address' => $validated['shipping_address'],
                'status' => 'pending',
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                    'selected_attributes' => $item->selected_attributes,
                ]);
            }

            CartItem::whereIn('id', $cartItems->pluck('id'))->delete();

            // 所有操作皆成功，提交交易
            DB::commit();

            return $this->sendResponse(['order_number' => $order->order_number], '訂單建立成功！');
        } catch (\Exception $e) {
            // 發生任何錯誤，還原所有資料庫操作
            DB::rollBack();

            // 💡 業界標準：安全地回傳錯誤訊息
            // 只有我們自定義的預期錯誤 (庫存不足、下架) 才回傳給前端，其餘系統底層錯誤應記錄 Log 並回傳模糊提示
            $errorMessage = $e->getMessage();
            if (!str_contains($errorMessage, '庫存不足') && !str_contains($errorMessage, '已下架')) {
                // 將真實的錯誤記錄到 Laravel Log，方便開發者除錯
                Log::error('Order Checkout Failed: ' . $e->getMessage());
                // 給使用者的安全提示
                $errorMessage = '系統繁忙，訂單建立失敗，請稍後再試。';
            }

            return $this->sendError($errorMessage, 400);
        }
    }

    // ==========================================
    // 🎉 新增：結帳成功頁面處理邏輯 (Step 3)
    // ==========================================
    public function success(Request $request)
    {
        $request->validate([
            'order_number' => ['required', 'string']
        ]);

        $orderNumber = $request->query('order_number');

        // 完美防禦：透過步驟 2 建立的關聯查詢，天然具備 IDOR 防護，查無資料直接拋出 404
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return \Inertia\Inertia::render('OrderSuccess', [
            'order' => $order
        ]);
    }
    /**
     * 顯示會員歷史訂單列表
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        if (!$userId) {
            return redirect()->route('login');
        }

        // 撈取該會員的訂單，包含明細與對應商品，並依建立時間反向排序 (最新的在前面)
        $orders = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        // 根據 LM AI 的建議，Inertia 頁面直接回傳 Inertia::render()，不需要 JSON 格式
        return Inertia::render('Member/Orders', [
            'orders' => $orders
        ]);
    }
    // 🌟 新增 show 方法
    public function show(Request $request, $orderNumber)
    {
        $userId = Auth::id();

        // 嚴格限制只能查閱屬於自己的訂單
        $order = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Member/OrderDetail', [
            'order' => $order
        ]);
    }
}
