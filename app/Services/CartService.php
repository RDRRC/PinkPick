<?php

namespace App\Services;

use App\Models\CartItem;
use Illuminate\Support\Facades\DB;

class CartService
{
    /**
     * 執行訪客購物車合併至會員購物車
     *
     * @param string $guestSessionId 訪客的 Session ID
     * @param int $userId 會員 ID
     */
    public function mergeGuestCart(string $guestSessionId, int $userId): void
    {
        // 🌟 優化：加入 DB::transaction 確保資料一致性，防呆防錯
        DB::transaction(function () use ($guestSessionId, $userId) {
            $guestCartItems = CartItem::where('session_id', $guestSessionId)
                ->whereNull('user_id')
                ->lockForUpdate() // 避免併發寫入衝突
                ->get();

            if ($guestCartItems->isEmpty()) {
                return;
            }

            foreach ($guestCartItems as $item) {
                $attributes = $item->selected_attributes ?? [];
                ksort($attributes);

                $newHashString = "U_{$userId}_{$item->product_id}_" . json_encode($attributes);
                $newItemHash = hash('sha256', $newHashString);

                $existingMemberItem = CartItem::where('item_hash', $newItemHash)->first();

                if ($existingMemberItem) {
                    $existingMemberItem->increment('quantity', $item->quantity);
                    $item->delete();
                } else {
                    $item->update([
                        'user_id' => $userId,
                        'session_id' => null,
                        'item_hash' => $newItemHash
                    ]);
                }
            }
        });
    }
    /**
     * 💡 第一層防禦：結帳前的終極檢驗閘門
     * 在 OrderController 開啟資料庫交易 (DB::beginTransaction) 前呼叫此方法
     */
    public function validateCartForCheckout(int|null $userId, string $sessionId): void
    {
        $query = CartItem::with('product');

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId)->whereNull('user_id');
        }

        $items = $query->get();

        if ($items->isEmpty()) {
            throw new \Exception('購物車目前是空的，無法進行結帳。');
        }

        foreach ($items as $item) {
            // 結帳瞬間的最後掃描：防範使用者停留頁面過久產生的時間差
            if (!$item->product || !$item->product->is_active) {
                $productName = $item->product ? $item->product->name : '未知商品';
                throw new \Exception("您選購的商品「{$productName}」已下架或失效，請返回購物車移除後再試。");
            }
        }
    }
}
