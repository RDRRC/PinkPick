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
}
