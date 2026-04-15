<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // 🌟 記得引入 Auth

class AdminOrderController extends Controller
{
    // 1. 顯示後台訂單列表
    public function index()
    {
        // 撈取全站所有訂單，並載入關聯明細，以最新訂單排序
        $orders = Order::with(['items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/OrderManagement', [
            'orders' => $orders
        ]);
    }

    // 2. 處理狀態更新請求
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            // 驗證狀態是否在我們資料庫設計的允許範圍內
            'status' => 'required|in:pending,paid,shipped,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        // 修改成功後返回上一頁 (Inertia 會自動更新畫面資料)
        return back();
    }
}
