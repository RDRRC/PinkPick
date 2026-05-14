<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * 建立訂單與扣除庫存 (核心防禦：悲觀鎖 + 排序防死鎖)
     */
    public function store(Request $request, CartService $cartService): JsonResponse
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_email' => 'required|email|max:255',
            'recipient_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string|max:255',
        ]);

        /** @var User $user */
        $user = Auth::user(); // 此處標註是為了確保後面 update 的安全感

        // 1. 自動儲存聯絡資訊
        $updateData = array_filter([
            'phone' => empty($user->phone) ? $validated['recipient_phone'] : null,
            'address' => empty($user->address) ? $validated['shipping_address'] : null,
        ]);
        if (!empty($updateData)) $user->update($updateData);

        // 2. 取得購物車與分障檢查 (Fail-Fast)
        $cartItems = CartItem::with(['product'])->where('user_id', $user->id)->get();
        if ($cartItems->isEmpty()) return $this->sendError('購物車為空', 400);

        $cartService->validateCartForCheckout($user->id, $request->session()->getId());

        // 3. 財務計算 (BCMath)
        $totalAmount = $cartItems->reduce(
            fn($total, $item) =>
            bcadd($total, bcmul((string)$item->product->price, (string)$item->quantity, 2), 2),
            '0.00'
        );

        DB::beginTransaction();
        try {
            // 💡 關鍵：排序鎖定防止 Deadlock
            $sortedItems = $cartItems->sortBy('product_id');

            foreach ($sortedItems as $item) {
                $product = Product::where('id', $item->product_id)->lockForUpdate()->first();
                if (!$product || $product->stock < $item->quantity) {
                    throw new \Exception("商品「{$item->product->name}」庫存不足或已下架");
                }
                $product->decrement('stock', $item->quantity);
            }

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => $user->id,
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
                    'price' => (string)$item->product->price, // 價格快照
                    'selected_attributes' => $item->selected_attributes,
                ]);
            }

            CartItem::whereIn('id', $cartItems->pluck('id'))->delete();
            DB::commit();

            return $this->sendResponse(['order_number' => $order->order_number], '訂單建立成功！');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("結帳失敗: " . $e->getMessage());
            return $this->sendError($e->getMessage(), 400);
        }
    }

    /**
     * 會員訂單列表 (優化：分頁保護 + IDOR 防護)
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if (!$user) return redirect()->route('login');

        // 💡 導入分頁：後端資料結構從 [] 變為 { data: [] }
        $orders = $user->orders()
            ->with(['items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Member/Orders', [
            'orders' => $orders
        ]);
    }

    /**
     * 訂單詳情 (IDOR 防護)
     */
    public function show(Request $request, string $orderNumber): Response
    {
        $order = $request->user()->orders()
            ->with(['items.product'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Member/OrderDetail', [
            'order' => $order
        ]);
    }
}
