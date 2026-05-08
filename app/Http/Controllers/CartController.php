<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // 【修復 1】引入 Auth Facade
use Illuminate\Database\UniqueConstraintViolationException;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $sessionId = $request->session()->getId();

        $query = CartItem::with(['product']);

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId)->whereNull('user_id');
        }

        $cartItems = $query->get();
        $removedCount = 0;

        // 💡 第三層防禦：無聲過濾並自動刪除已下架的商品
        $validCartItems = $cartItems->reject(function ($item) use (&$removedCount) {
            // 檢查關聯的商品是否存在且為上架狀態
            if (!$item->product || !$item->product->is_active) {
                $item->delete(); // 從資料庫默默移除
                $removedCount++;
                return true; // 標記為從目前的陣列中剔除
            }
            return false; // 保留正常商品
        })->values(); // 重新整理陣列的 Key，避免前端 React 迴圈報錯

        $message = '購物車內容取得成功';
        if ($removedCount > 0) {
            // 變更 API 成功訊息，或者如果你前端有接 Session Toast，可以取消註解下一行
            // session()->flash('warning', "已為您自動移除 {$removedCount} 件下架商品");
            $message = "購物車更新：已自動為您移除 {$removedCount} 件下架商品";
        }

        return $this->sendResponse($validCartItems, $message);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1',
            'selected_attributes' => 'nullable|array',
        ]);

        // 🌟 修正：移到最外層！確保所有加入動作都受到源頭防禦
        $product = Product::where('is_active', true)->findOrFail($validated['product_id']);

        $attributes = $validated['selected_attributes'] ?? [];

        if (!empty($attributes)) {
            // 原本這裡的 findOrFail 已經不需要了，直接使用上方撈好的 $product
            $validValueIds = $product->attributes()->pluck('id')->toArray();

            foreach ($attributes as $attrId => $valueId) {
                if (!in_array($valueId, $validValueIds)) {
                    return $this->sendError('選擇的商品規格無效或已被移除', 400, 'INVALID_ATTRIBUTE');
                }
            }
        }

        // 【修復 1】改用 Auth::id() 消除 Intelephense 警告
        $userId = Auth::id();
        $sessionId = $request->session()->getId();

        // 確保 Hash 生成順序一致
        ksort($attributes);

        $identifier = $userId ? "U_{$userId}" : "S_{$sessionId}";
        $hashString = "{$identifier}_{$validated['product_id']}_" . json_encode($attributes);
        $itemHash = hash('sha256', $hashString);

        try {
            CartItem::create([
                'user_id' => $userId,
                'session_id' => $userId ? null : $sessionId,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'] ?? 1,
                'selected_attributes' => $attributes,
                'item_hash' => $itemHash,
            ]);
        } catch (UniqueConstraintViolationException $e) {
            CartItem::where('item_hash', $itemHash)
                ->increment('quantity', $validated['quantity'] ?? 1);
        }

        return $this->sendResponse(null, '商品已成功加入購物車');
    }
    /**
     * 更新購物車商品數量
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::find($id);

        if (!$cartItem) {
            return $this->sendError('找不到該購物車項目', 404);
        }

        $userId = Auth::id();
        $sessionId = $request->session()->getId();

        // 【安全防護】嚴謹的所有權判斷 (IDOR 防護)
        $isOwner = $userId
            ? ($cartItem->user_id === $userId)
            : ($cartItem->session_id === $sessionId && is_null($cartItem->user_id));

        if (!$isOwner) {
            return $this->sendError('無權限修改此項目', 403);
        }

        $cartItem->update([
            'quantity' => $validated['quantity']
        ]);

        return $this->sendResponse(null, '購物車數量已更新');
    }

    /**
     * 移除購物車內的特定商品
     */
    public function destroy(Request $request, string $id)
    {
        $cartItem = CartItem::find($id);

        if (!$cartItem) {
            return $this->sendError('找不到該購物車項目', 404);
        }

        $userId = Auth::id();
        $sessionId = $request->session()->getId();

        // 【安全防護】嚴謹的所有權判斷 (IDOR 防護)
        $isOwner = $userId
            ? ($cartItem->user_id === $userId)
            : ($cartItem->session_id === $sessionId && is_null($cartItem->user_id));

        if (!$isOwner) {
            return $this->sendError('無權限刪除此項目', 403);
        }

        $cartItem->delete();

        return $this->sendResponse(null, '商品已從購物車移除');
    }
}
