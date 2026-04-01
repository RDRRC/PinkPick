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
        // 【修復 1】改用 Auth::id() 消除 Intelephense 警告
        $userId = Auth::id();
        $sessionId = $request->session()->getId();

        $query = CartItem::with(['product']);

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId)->whereNull('user_id');
        }

        $cartItems = $query->get();
        return $this->sendResponse($cartItems, '購物車內容取得成功');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1',
            'selected_attributes' => 'nullable|array',
        ]);

        $attributes = $validated['selected_attributes'] ?? [];

        // EAV 規格防護：確保前端傳來的規格確實存在於該商品中
        if (!empty($attributes)) {
            // 直接找商品 (不需 with，因為下一行直接用 Query Builder)
            $product = Product::findOrFail($validated['product_id']);

            // 【修復 2】加上 () 呼叫 attributes() 方法，避免與 Laravel 底層 $attributes 陣列衝突
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
}
