import React from 'react';
import { Link, usePage } from '@inertiajs/react'; // 【優化】引入 usePage
import { useCart } from '../Contexts/CartContext';

export default function Navbar() {
    // 【核心優化】：直接從 Inertia 全域取得 auth，免去父層層層傳遞的麻煩
    const { auth } = usePage().props;

    // 取得購物車的總數量
    const { cartCount } = useCart();

    return (
        <nav className="bg-white shadow p-4 mb-6 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                    <Link href="/shop">PinkPick Demo</Link>
                </h1>

                <div className="flex items-center gap-6">

                    {/* --- 購物車按鈕區塊 --- */}
                    <Link href="/cart" className="relative flex items-center text-gray-600 hover:text-pink-600 transition">
                        {/* 購物車 SVG 圖示 */}
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            ></path>
                        </svg>

                        {/* 動態數字徽章 Badge */}
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                    {/* ------------------- */}

                    <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
                        {auth?.user ? (
                            <>
                                <span className="text-gray-700 font-medium">Hi, {auth.user.name} 👋</span>
                                <Link href="/logout" method="post" as="button" className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition">登出</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm text-gray-600 hover:text-pink-600 transition">登入</Link>
                                <Link href="/register" className="text-sm bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition">註冊</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}