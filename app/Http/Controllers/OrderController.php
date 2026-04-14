<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Product; // 剛才提醒要補上的
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

        // 這裡的 with(['product']) 用於計算總價與建立明細，但不可用於庫存檢查
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
}
