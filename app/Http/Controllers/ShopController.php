<?php

namespace App\Http\Controllers;

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
}