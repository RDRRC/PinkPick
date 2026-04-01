<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController; // 🌟 1. 在最上面新增這行，匯入 ShopController
// 👇 新增這行：引入我們剛寫好的購物車控制器
use App\Http\Controllers\CartController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/shop');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// === 1. 購物車頁面路由 (Inertia 專用語法糖) ===
Route::inertia('/cart', 'Cart')->name('cart.page');

// === 2. 購物車資料 API 路由 (路徑改為 /cart/items) ===
Route::get('/cart/items', [CartController::class, 'index'])->name('cart.items.index');
Route::post('/cart/items', [CartController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{id}', [CartController::class, 'update'])->name('cart.items.update');
Route::delete('/cart/items/{id}', [CartController::class, 'destroy'])->name('cart.items.destroy');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

// 🌟 2. 把原本寫著 function() {...} 的那段，改成下面這行簡潔的寫法
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
