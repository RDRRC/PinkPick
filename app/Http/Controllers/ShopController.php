<?php
// 檔案路徑：app/Http/Controllers/ShopController.php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response; // 💡 嚴格標註回傳型別
use Illuminate\Support\Facades\Log;

class ShopController extends Controller
{
    /**
     * 顯示商城首頁 (骨架渲染)
     * 
     * [Assumed: 實際商品資料由前端 Shop.jsx 透過 Axios 呼叫 API 非同步載入]
     */
    public function index(): Response
    {
        // 僅回傳前端進入點，不執行冗餘的資料庫查詢
        return Inertia::render('Shop');
    }

    /**
     * 顯示單一商品詳情 (同步渲染)
     *
     * @param string $id 
     */
    public function show(string $id): Response
    {
        try {
            // 🛡️ 防禦性查詢：利用 where 預先過濾下架商品，並使用嵌套預載入解決 N+1 問題
            $product = Product::with(['category', 'attributes.attribute'])
                ->where('is_active', true)
                ->findOrFail($id);

            return Inertia::render('ProductDetail', [
                'product' => $product
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // 💡 精準捕捉找不到或已下架的例外，交由原生機制拋出標準 404
            Log::info("嘗試存取不存在或已下架的商品: {$id}");
            abort(404, '該商品已下架或不存在');
        }
        // ⚠️ 刻意不捕捉通用 \Exception，交由全域 Handler 處理，避免前端讀取 null 導致 TypeError 崩潰
    }
}
