// 檔案路徑：resources/js/Pages/Admin/Orders.jsx

import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Pagination from '@/Components/Pagination'; // 🌟 確保引入自訂分頁元件

export default function OrderManagement({ orders }) {
    const [processingId, setProcessingId] = useState(null);

    const handleStatusChange = (orderId, newStatus) => {
        setProcessingId(orderId);

        router.patch(route('admin.orders.update_status', orderId), {
            status: newStatus
        }, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };

    // 🌟 修正：精準對接現有 Pagination 元件的換頁邏輯
    const handlePageChange = (newPage) => {
        router.get(route('admin.orders.index'), { page: newPage }, {
            preserveScroll: true
        });
    };

    const statusMap = {
        pending: '待處理 (Pending)',
        paid: '已付款 (Paid)',
        shipped: '已出貨 (Shipped)',
        completed: '已完成 (Completed)',
        cancelled: '已取消 (Cancelled)'
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head title="後台訂單管理 - PinkPick" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">🚀 後台管理：所有訂單</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold border-b">訂單編號 / 時間</th>
                                    <th className="px-6 py-4 font-bold border-b">買家資訊</th>
                                    <th className="px-6 py-4 font-bold border-b">總金額</th>
                                    <th className="px-6 py-4 font-bold border-b">狀態變更</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{order.order_number}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(order.created_at).toLocaleString('zh-TW')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800">{order.recipient_name}</div>
                                            <div className="text-xs text-gray-500">{order.recipient_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-pink-600">
                                            ${Number(order.total_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    disabled={processingId === order.id}
                                                    className={`text-sm border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500
                                                        ${order.status === 'completed' ? 'bg-green-50 text-green-700 font-bold' :
                                                            order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 font-bold' : ''}
                                                    `}
                                                >
                                                    {Object.entries(statusMap).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                                {processingId === order.id && <span className="text-xs text-gray-400">更新中...</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {orders.data.length === 0 && (
                    <div className="text-center py-12 text-gray-500">目前還沒有任何訂單。</div>
                )}

                {/* 🌟 修正：精準對接自訂的 Pagination 元件 */}
                {orders.data.length > 0 && orders.last_page > 1 && (
                    <div className="mt-6 pb-6">
                        <Pagination
                            page={orders.current_page}
                            lastPage={orders.last_page}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}