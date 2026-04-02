<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/shop');
Route::get('/shop', [ShopController::class, 'index'])->name('shop'); // 移到上方整理

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ==========================================
// 🛒 購物車相關路由 (不加 auth，允許訪客操作)
// ==========================================
Route::inertia('/cart', 'Cart')->name('cart.page');
Route::get('/cart/items', [CartController::class, 'index'])->name('cart.items.index');
Route::post('/cart/items', [CartController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{id}', [CartController::class, 'update'])->name('cart.items.update');
Route::delete('/cart/items/{id}', [CartController::class, 'destroy'])->name('cart.items.destroy');

// ==========================================
// 🔐 會員專屬路由 (Auth Middleware 防護網)
// ==========================================
Route::middleware('auth')->group(function () {
    // 個人資料管理
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // 結帳與訂單流程 (移入此區塊)
    Route::inertia('/checkout', 'Checkout')->name('checkout.page');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

    // 新增結帳成功頁面路由 (使用 order_number 作為路由參數提升安全性與易讀性)
    Route::get('/orders/success', [OrderController::class, 'success'])->name('orders.success');
});

require __DIR__ . '/auth.php';
