<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // 🌟 實作第 2 點：關鍵字搜尋 (針對商品名稱)
        $query->when($request->input('keyword'), function ($q, $keyword) {
            $q->where('name', 'like', "%{$keyword}%");
        });

        // 🌟 記得加上 withQueryString()，否則按下第二頁時搜尋條件會被清空
        $products = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $categories = Category::all();

        return Inertia::render('Admin/ProductManagement', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only('keyword') // 將搜尋條件傳回前端保留在輸入框
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Product::create($validated);

        return back();
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return back();
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back();
    }
}
