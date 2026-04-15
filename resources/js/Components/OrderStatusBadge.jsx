import React from 'react';

export default function OrderStatusBadge({ status }) {
    // 🌟 將 Mapping 表統一集中管理
    const statusMap = {
        pending: '待處理 (Pending)',
        paid: '已付款 (Paid)',
        shipped: '已出貨 (Shipped)',
        completed: '已完成 (Completed)',
        cancelled: '已取消 (Cancelled)'
    };

    // 🌟 將顏色邏輯統一集中管理
    const getColorClasses = (currentStatus) => {
        switch (currentStatus) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(status)}`}>
            {statusMap[status] || status.toUpperCase()}
        </span>
    );
}