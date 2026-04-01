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

// 👇 新增這區塊：購物車 API 路由
// 放在 web.php 中，Laravel 會自動套用 web middleware，啟動 Session 與 CSRF 保護
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

// 🌟 2. 把原本寫著 function() {...} 的那段，改成下面這行簡潔的寫法
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
