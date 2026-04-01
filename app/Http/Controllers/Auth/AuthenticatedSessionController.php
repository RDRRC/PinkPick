<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 【關鍵防護 1】在認證與 Session 重新生成「之前」，先抓出舊的 Session ID
        $guestSessionId = $request->session()->getId();

        $request->authenticate();
        $request->session()->regenerate(); // Laravel 在此會發放全新的 Session ID

        // 【關鍵防護 2】開始執行合併邏輯
        $userId = Auth::id();

        $guestCartItems = \App\Models\CartItem::where('session_id', $guestSessionId)
            ->whereNull('user_id')
            ->get();

        foreach ($guestCartItems as $item) {
            $attributes = $item->selected_attributes ?? [];
            ksort($attributes);
            // 改用 U_ 開頭重算會員專屬的 Hash
            $newHashString = "U_{$userId}_{$item->product_id}_" . json_encode($attributes);
            $newItemHash = hash('sha256', $newHashString);

            $existingMemberItem = \App\Models\CartItem::where('item_hash', $newItemHash)->first();

            if ($existingMemberItem) {
                // 會員原本就有同規格商品：合併數量，刪除訪客紀錄
                $existingMemberItem->increment('quantity', $item->quantity);
                $item->delete();
            } else {
                // 會員原本沒有：直接過戶
                $item->update([
                    'user_id' => $userId,
                    'session_id' => null,
                    'item_hash' => $newItemHash
                ]);
            }
        }

        return redirect()->intended(route('shop', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/shop');
    }
}
