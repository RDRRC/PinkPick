// resources/js/Pages/Member/Orders.jsx
import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';

export default function Orders({ orders }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head title="我的訂單 - PinkPick" />
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* 修改標題區域：使用 flex 讓標題和按鈕並排 */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">我的訂單</h1>
                    <Link
                        href="/shop"
                        className="text-sm font-medium text-pink-600 hover:text-pink-700 transition"
                    >
                        ← 回到商城購物
                    </Link>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                        <p className="text-gray-500 mb-4">您目前還沒有任何訂單紀錄。</p>
                        <Link
                            href="/shop"
                            className="inline-block bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition"
                        >
                            馬上去逛逛
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                {/* 訂單標頭 */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">訂單編號</p>
                                        <p className="font-medium text-gray-900">{order.order_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">訂單日期</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(order.created_at).toLocaleDateString('zh-TW')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">總金額</p>
                                        <p className="font-medium text-pink-600">${Number(order.total_amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {/* 這裡可以寫一個狀態對應表，暫時先直接顯示英文或簡單判斷 */}
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* 訂單明細 (選做，若後端有回傳 items) */}
                                {order.items && order.items.length > 0 && (
                                    <div className="px-6 py-4">
                                        <ul className="divide-y divide-gray-100">
                                            {order.items.map((item) => (
                                                <li key={item.id} className="py-3 flex justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.product?.name || '已下架商品'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            數量: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-900">
                                                        ${Number(item.price).toLocaleString()}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* 列表底部也可以選擇性再放一個按鈕 */}
                        <div className="text-center mt-8">
                            <Link href="/shop" className="text-gray-500 hover:text-pink-600 text-sm">
                                想買更多嗎？回到商城看看
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}