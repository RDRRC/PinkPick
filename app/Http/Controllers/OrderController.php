<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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

        // 💡 優化點：因為已受 Auth Middleware 保護，直接撈取當前會員的購物車即可，大幅簡化邏輯
        $cartItems = CartItem::with(['product'])
            ->where('user_id', $userId)
            ->get();

        if ($cartItems->isEmpty()) {
            return $this->sendError('購物車是空的，無法結帳', 400);
        }

        $totalAmount = $cartItems->reduce(function ($total, $item) {
            return $total + ($item->product->price * $item->quantity);
        }, 0);

        DB::beginTransaction();

        try {
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

            DB::commit();

            return $this->sendResponse(['order_number' => $order->order_number], '訂單建立成功！');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('訂單建立失敗，請稍後再試。', 500);
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
}
