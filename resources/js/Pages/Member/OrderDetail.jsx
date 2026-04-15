import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';

export default function OrderDetail({ order }) {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head title={`訂單詳情 ${order.order_number} - PinkPick`} />
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-6">
                    {/* 🌟 優化：使用 Ziggy 命名路由 */}
                    <Link href={route('member.orders')} className="text-sm text-gray-500 hover:text-pink-600 transition">
                        ← 返回我的訂單
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* 頂部訂單摘要標題 */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">訂單詳情</h1>
                            <p className="text-sm text-gray-500 mt-1">{order.order_number}</p>
                        </div>
                        <div className="text-right">
                            {/* 🌟 2. 替換為極度乾淨的寫法 */}
                            <OrderStatusBadge status={order.status} />

                            <p className="text-sm text-gray-500 mt-2">
                                成立時間：{new Date(order.created_at).toLocaleString('zh-TW')}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 左側：收件資訊 */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">收件人資訊</h2>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li><span className="font-medium text-gray-500 w-20 inline-block">姓名：</span> {order.recipient_name}</li>
                                <li><span className="font-medium text-gray-500 w-20 inline-block">聯絡電話：</span> {order.recipient_phone}</li>
                                <li><span className="font-medium text-gray-500 w-20 inline-block">電子郵件：</span> {order.recipient_email}</li>
                                <li><span className="font-medium text-gray-500 w-20 inline-block">配送地址：</span> {order.shipping_address}</li>
                            </ul>
                        </div>

                        {/* 右側：金額摘要 */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">付款明細</h2>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex justify-between">
                                    <span className="text-gray-500">商品總計</span>
                                    <span>${Number(order.total_amount).toLocaleString()}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-500">運費</span>
                                    <span className="text-green-600 font-medium">免運費</span>
                                </li>
                                <li className="flex justify-between items-center border-t pt-3 mt-3">
                                    <span className="font-bold text-gray-800 text-base">總結帳金額</span>
                                    <span className="font-bold text-red-600 text-xl">${Number(order.total_amount).toLocaleString()}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 下方：購買的商品清單 */}
                    <div className="border-t border-gray-200">
                        <div className="bg-gray-50 px-6 py-3">
                            <h2 className="text-sm font-bold text-gray-700">購買商品明細</h2>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <li key={item.id} className="p-6 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                                        Img
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{item.product?.name || '已下架商品'}</p>

                                        {/* 渲染結帳時的歷史規格快照 */}
                                        {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                                {Object.entries(item.selected_attributes).map(([attrId, valId]) => (
                                                    <span key={attrId} className="bg-gray-100 px-2 py-1 rounded">
                                                        規格{attrId} : 選項{valId}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">單價 ${Number(item.price).toLocaleString()} x {item.quantity}</p>
                                        <p className="font-bold text-pink-600 mt-1">
                                            小計 ${(Number(item.price) * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}