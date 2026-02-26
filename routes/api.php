<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController; // 記得引入這一行

// 這行是 Laravel 預設給你的 (取得使用者資訊)，留著沒關係
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ▼▼▼ 這是我們的新增的商品篩選路由 ▼▼▼
Route::get('/products', [ProductController::class, 'index']);