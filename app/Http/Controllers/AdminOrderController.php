<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminOrderController extends Controller
{
    /**
     * 顯示訂單管理列表
     */
    public function index(): Response
    {

        Gate::authorize('admin');

        try {
            $orders = Order::with(['items.product'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return Inertia::render('Admin/OrderManagement', [
                'orders' => $orders
            ]);
        } catch (\Exception $e) {
            Log::error('AdminOrderController@index 發生異常: ' . $e->getMessage());
            $emptyPaginator = new LengthAwarePaginator(
                items: [],
                total: 0,
                perPage: 20,
                currentPage: 1,
                options: ['path' => request()->url()]
            );

            return Inertia::render('Admin/OrderManagement', [
                'orders' => $emptyPaginator
            ]);
        }
    }

    /**
     * 更新訂單狀態
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        Gate::authorize('admin');

        $validated = $request->validate([
            'status' => 'required|in:pending,paid,shipped,completed,cancelled'
        ]);

        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => $validated['status']]);

            return back()->with('success', '訂單狀態更新成功');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('嘗試更新不存在的訂單狀態: ' . $id);
            return back()->withErrors(['error' => '找不到指定的訂單資料。']);
        } catch (\Exception $e) {
            Log::error('AdminOrderController@updateStatus 發生異常: ' . $e->getMessage());
            return back()->withErrors(['error' => '系統異常，訂單狀態更新失敗。']);
        }
    }
}
