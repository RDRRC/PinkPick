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
        // 1. 表單驗證
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_email' => 'required|email|max:255',
            'recipient_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string|max:255',
        ]);

        $userId = Auth::id();
        $sessionId = $request->session()->getId();

        // 2. 抓取當前購物車內容 (同 CartController 邏輯)
        $cartItems = CartItem::with(['product'])->where(function ($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId)->whereNull('user_id');
            }
        })->get();

        if ($cartItems->isEmpty()) {
            return $this->sendError('購物車是空的，無法結帳', 400);
        }

        // 3. 【資安防護】在後端重新計算總金額，不依賴前端傳送的值
        $totalAmount = $cartItems->reduce(function ($total, $item) {
            return $total + ($item->product->price * $item->quantity);
        }, 0);

        // 4. 開啟資料庫交易 (Database Transaction)
        DB::beginTransaction();
        try {
            // A. 建立主訂單
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

            // B. 轉移購物車明細到訂單明細
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    // 記錄結帳當下的「歷史單價」，避免未來商品漲價影響過去的訂單
                    'price' => $item->product->price,
                    'selected_attributes' => $item->selected_attributes,
                ]);
            }

            // C. 清空已經結帳的購物車商品
            CartItem::whereIn('id', $cartItems->pluck('id'))->delete();

            DB::commit(); // 提交交易

            // 回傳訂單編號給前端，以便後續跳轉到成功頁面
            return $this->sendResponse(['order_number' => $order->order_number], '訂單建立成功！');
        } catch (\Exception $e) {
            DB::rollBack(); // 發生錯誤時，還原所有異動 (錢與訂單都不算數)
            return $this->sendError('訂單建立失敗，請稍後再試。', 500);
        }
    }
}
