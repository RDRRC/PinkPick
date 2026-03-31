<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class ProductController extends Controller
{
    /**
     * 商品列表 API (支援動態篩選)
     * GET /api/products?category_id=1&price_min=1000&sort=price_asc
     */
    public function index(Request $request)
    {
        // 1. 建立查詢建構器 (Query Builder)
        // 並且使用 with() 預先載入關聯資料，解決 N+1 問題 (面試必問！)
        $query = Product::query()->with(['category', 'attributes']);

        // 2. 關鍵字搜尋 (針對商品名稱)
        $query->when($request->input('keyword'), function (Builder $q, $keyword) {
            $q->where('name', 'like', "%{$keyword}%");
        });

        // 3. 分類篩選
        $query->when($request->input('category_id'), function (Builder $q, $categoryId) {
            $q->where('category_id', $categoryId);
        });

        // 4. 價格區間篩選
        $query->when($request->input('price_min'), function (Builder $q, $priceMin) {
            $q->where('price', '>=', $priceMin);
        });
        $query->when($request->input('price_max'), function (Builder $q, $priceMax) {
            $q->where('price', '<=', $priceMax);
        });

        // 5. 屬性篩選 (這是最難的部分 - 魔王關卡)
        // 假設前端傳來: ?attributes[品牌]=Apple&attributes[記憶體]=16GB
        if ($request->has('attributes')) {
            foreach ($request->input('attributes') as $attrName => $attrValue) {
                // 使用 whereHas 查詢關聯表
                $query->whereHas('attributes', function (Builder $q) use ($attrName, $attrValue) {
                    // 這裡的邏輯是：找出「屬性值」符合且「屬性名稱」也符合的商品
                    // 注意：這裡簡化處理，直接查 value (因為我們的 Seeder value 是唯一的)
                    $q->where('value', $attrValue);
                });
            }
        }

        // 6. 排序 (預設依照 ID 排序)
        $sort = $request->input('sort', 'newest'); // default newest
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            default:
                $query->orderBy('id', 'desc');
                break;
        }

        // 7. 分頁 (每頁 20 筆)
        // Laravel 會自動處理 page 參數
        $products = $query->paginate(20);

        // 8. 回傳 JSON
        // 🌟 應用您剛寫好的共用方法！
        return $this->sendResponse($products, '商品列表取得成功');

        // // 測試情境一：傳入陣列，並指定狀態碼為 422
        // return $this->sendError(
        //     ['keyword' => ['搜尋關鍵字包含無效字元', '關鍵字太長']],
        //     422,
        //     'VALIDATION_FAILED'
        // );

        // // 測試情境二：傳入字串，使用預設的 404 狀態碼
        // return $this->sendError(
        //     '您搜尋的分類目前已經下架囉！',
        //     404,
        //     'CATEGORY_NOT_FOUND'
        // );

        // // 測試情境三：模擬 Laravel 底層拋出帶有敏感資訊的 500 錯誤
        // return response()->json([
        //     'message' => 'SQLSTATE[HY000] Access denied for user root@localhost...'
        // ], 500);
    }
}
