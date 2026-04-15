<?php

namespace App\Http\Controllers;

use App\Models\Product; // 🌟 記得引入 Product 模型
use Illuminate\Http\Request;
use Inertia\Inertia; // 🌟 1. 這裡非常重要！必須把 Inertia 匯入進來

class ShopController extends Controller
{
    // 🌟 2. 新增這個 index 方法，這是大門警衛指定的接洽窗口
    public function index()
    {
        // 🌟 3. 回傳名為 Shop 的前端畫面 (這會對應到 resources/js/Pages/Shop.jsx)
        return Inertia::render('Shop');
    }
    // 🌟 新增：取得單一商品詳情
    public function show($id)
    {
        // 🌟 完美修正：使用嵌套預載入，一次拉出商品、分類、規格值、以及規格母名稱
        $product = Product::with(['category', 'attributes.attribute'])->findOrFail($id);

        abort_if(!$product->is_active, 404, '該商品已下架或不存在');

        return Inertia::render('ProductDetail', [
            'product' => $product
        ]);
    }
}
