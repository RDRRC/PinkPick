import React, { useMemo } from 'react'; // 【優化】引入 useMemo
import { Head, Link } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import { useCart } from '../Contexts/CartContext';

export default function Cart() {
    const { cartItems, updateQuantity, removeFromCart } = useCart();

    // 【核心優化】：使用 useMemo 快取總金額計算結果，避免畫面渲染時重複執行迴圈
    const totalAmount = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = item.product?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    }, [cartItems]); // 只有當 cartItems 改變時，才重新計算

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            <Head title="購物車 - PinkPick" />

            <Navbar />

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">購物車清單</h1>

                {cartItems.length === 0 ? (
                    // 購物車空狀態 (Empty State)
                    <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <p className="text-gray-500 text-lg mb-6 font-medium">您的購物車目前是空的</p>
                        <Link
                            href="/shop"
                            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 font-bold transition shadow-md"
                        >
                            馬上開始選購
                        </Link>
                    </div>
                ) : (
                    // 購物車有商品的雙欄佈局
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* 左側：商品明細列表 */}
                        <div className="lg:w-2/3">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50 transition">

                                            {/* 圖片佔位 */}
                                            <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-gray-400 font-medium">
                                                Image
                                            </div>

                                            {/* 資訊區塊 */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    <Link href="/shop" className="hover:text-pink-600 transition">
                                                        {item.product?.name || '已下架商品'}
                                                    </Link>
                                                </h3>

                                                {/* 動態規格顯示 */}
                                                {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                                                        {Object.entries(item.selected_attributes).map(([attrId, valId]) => {
                                                            // 註：未來若後端 eager load 關聯，可在此替換為真實名稱
                                                            const attrName = `規格 ${attrId}`;
                                                            const valName = `選項 ${valId}`;

                                                            return (
                                                                <span key={attrId} className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600 border border-gray-200">
                                                                    {attrName} : {valName}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div className="mt-3 text-pink-600 font-bold text-lg">
                                                    ${Number(item.product?.price || 0).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* 數量調整與刪除區塊 */}
                                            <div className="flex items-center gap-4 mt-4 sm:mt-0">

                                                {/* 增減數量按鈕 */}
                                                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="px-4 py-1.5 text-gray-800 font-bold border-l border-r border-gray-300 text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* 移除商品按鈕 */}
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('確定要從購物車移除此商品嗎？')) {
                                                            removeFromCart(item.id);
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition p-2 bg-gray-50 rounded-md hover:bg-red-50"
                                                    title="移除商品"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 右側：結帳總結 (Order Summary) */}
                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">訂單摘要</h2>

                                <div className="flex justify-between mb-4 text-gray-600">
                                    <span>商品總計</span>
                                    {/* 【優化】直接取用 useMemo 計算好的變數 */}
                                    <span>${totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-4 text-gray-600">
                                    <span>運費</span>
                                    <span className="text-green-600 font-medium">免運費</span>
                                </div>

                                <div className="border-t pt-4 mt-4 flex justify-between items-center mb-6">
                                    <span className="text-lg font-bold text-gray-800">總結帳金額</span>
                                    <span className="text-3xl font-bold text-red-600">
                                        ${totalAmount.toLocaleString()}
                                    </span>
                                </div>

                                <button className="w-full bg-pink-600 text-white py-3.5 rounded-lg font-bold text-lg hover:bg-pink-700 transition shadow-md flex justify-center items-center gap-2">
                                    前往結帳
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>

                                <div className="mt-4 text-xs text-center text-gray-400">
                                    點擊「前往結帳」代表您同意 PinkPick 的服務條款。
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}