<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. 基礎導向與商城 (全域公開)
Route::redirect('/', '/shop');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');

// 2. 購物車相關 (全域公開：允許訪客將商品放入 Session 購物車)
Route::inertia('/cart', 'Cart')->name('cart.page');
Route::get('/cart/items', [CartController::class, 'index'])->name('cart.items.index');
Route::post('/cart/items', [CartController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{id}', [CartController::class, 'update'])->name('cart.items.update');
Route::delete('/cart/items/{id}', [CartController::class, 'destroy'])->name('cart.items.destroy');

// 3. 會員驗證區 (需登入才能訪問)
Route::middleware(['auth'])->group(function () {

    // Dashboard (Breeze 預設)
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(['verified'])->name('dashboard');

    // 個人資料管理
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // === 核心結帳與訂單流程 (本次新增/搬移至此) ===
    Route::inertia('/checkout', 'Checkout')->name('checkout.page'); // 結帳頁面
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store'); // 建立訂單 API

    // (預留) 下一小步：結帳成功頁面
    // Route::get('/orders/success', [OrderController::class, 'success'])->name('orders.success');
});

require __DIR__ . '/auth.php';
