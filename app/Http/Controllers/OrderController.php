<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse; // 新增引入
use Illuminate\Http\RedirectResponse; // 新增引入

class OrderController extends Controller
{
    /**
     * 建立訂單與扣除庫存
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_email' => 'required|email|max:255',
            'recipient_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string|max:255',
        ]);

        $userId = Auth::id();
        $user = Auth::user();

        assert($user instanceof User);


        // ==========================================
        // 🌟 無感儲存會員預設聯絡資訊
        // ==========================================
        if ($user) {
            $updateData = [];

            if (empty($user->phone) && $request->filled('recipient_phone')) {
                $updateData['phone'] = $request->recipient_phone;
            }

            if (empty($user->address) && $request->filled('shipping_address')) {
                $updateData['address'] = $request->shipping_address;
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }
        }

        $cartItems = CartItem::with(['product'])
            ->where('user_id', $userId)
            ->get();

        if ($cartItems->isEmpty()) {
            return $this->sendError('購物車是空的，無法結帳', 400);
        }

        // ==========================================
        // 💰 SCOPE 財務安全性：使用 BCMath 處理精確小數運算
        // // [Assumed: 價格與總金額皆以小數 (Decimal) 儲存，且 PHP 已安裝 BCMath 擴充]
        // ==========================================
        $totalAmount = $cartItems->reduce(function (string $total, CartItem $item): string {
            // bcmul: 乘法 (單價 * 數量)，保留 2 位小數
            $itemTotal = bcmul((string) $item->product->price, (string) $item->quantity, 2);

            // bcadd: 加法 (總計 + 當前項目總額)，保留 2 位小數
            return bcadd($total, $itemTotal, 2);
        }, '0.00'); // 初始值設定為字串 '0.00'

        DB::beginTransaction();

        try {
            // 📦 悲觀鎖 (Pessimistic Locking) 庫存扣除
            foreach ($cartItems as $item) {
                $product = Product::where('id', $item->product_id)
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    throw new \Exception("商品「{$item->product->name}」已下架或不存在。");
                }

                if ($product->stock < $item->quantity) {
                    throw new \Exception("抱歉，商品「{$product->name}」庫存不足，僅剩 {$product->stock} 件。");
                }

                $product->decrement('stock', $item->quantity);
            }

            // 📝 訂單建立邏輯
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
                    // 強制轉型為字串以防範浮點數漂移，完美對應 DB 的 decimal
                    'price' => (string) $item->product->price,
                    'selected_attributes' => $item->selected_attributes,
                ]);
            }

            CartItem::whereIn('id', $cartItems->pluck('id'))->delete();

            DB::commit();

            return $this->sendResponse(['order_number' => $order->order_number], '訂單建立成功！');
        } catch (\Exception $e) {
            DB::rollBack();

            $errorMessage = $e->getMessage();
            if (!str_contains($errorMessage, '庫存不足') && !str_contains($errorMessage, '已下架')) {
                Log::error('Order Checkout Failed: ' . $e->getMessage());
                $errorMessage = '系統繁忙，訂單建立失敗，請稍後再試。';
            }

            return $this->sendError($errorMessage, 400);
        }
    }

    /**
     * 結帳成功頁面處理邏輯
     */
    public function success(Request $request): \Inertia\Response
    {
        $request->validate([
            'order_number' => ['required', 'string']
        ]);

        $orderNumber = $request->query('order_number');

        // 完美防禦：天然具備 IDOR 防護
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('OrderSuccess', [
            'order' => $order
        ]);
    }

    /**
     * 顯示會員歷史訂單列表
     */
    public function index(Request $request): \Inertia\Response|RedirectResponse
    {
        $userId = Auth::id();

        if (!$userId) {
            return redirect()->route('login');
        }

        $orders = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Member/Orders', [
            'orders' => $orders
        ]);
    }

    /**
     * 顯示單筆訂單詳情
     */
    public function show(Request $request, string $orderNumber): \Inertia\Response
    {
        $userId = Auth::id();

        $order = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Member/OrderDetail', [
            'order' => $order
        ]);
    }
}
