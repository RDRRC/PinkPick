<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController; // 🌟 1. 在最上面新增這行，匯入 ShopController
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/shop');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// 🌟 2. 把原本寫著 function() {...} 的那段，改成下面這行簡潔的寫法
Route::get('/shop', [ShopController::class, 'index'])->name('shop');