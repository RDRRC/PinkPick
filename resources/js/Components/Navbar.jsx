// resources/js/Components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '../Contexts/CartContext';

export default function Navbar() {
    const { auth } = usePage().props;
    const { cartCount } = useCart();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 🌟 優化 1：將權限判斷提取為獨立變數，建議未來後端 API 應多傳遞一個 `is_admin` 或 `role` 欄位
    // 目前先向下相容您的 email 判斷，但為未來的擴充打好基礎
    const isAdmin = auth?.user?.is_admin || auth?.user?.email === 'admin@pinkpick.com';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 🌟 優化 2：封裝一個通用的手機版選單關閉函式，讓程式碼更乾淨
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* 左側 Logo */}
                    <div className="flex items-center">
                        <Link href="/shop" className="text-xl font-extrabold text-pink-600 hover:text-pink-700 transition">
                            PinkPick
                        </Link>
                    </div>

                    {/* 桌機版選單 */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* 購物車 */}
                        <Link href="/cart" className="relative text-gray-600 hover:text-pink-600 transition flex items-center p-2" aria-label="購物車">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-600 rounded-full">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* 使用者下拉選單 */}
                        {auth?.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition focus:outline-none"
                                    aria-expanded={isDropdownOpen}
                                    aria-haspopup="true"
                                >
                                    <span className="font-medium">Hi, {auth.user.name}</span>
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-50">
                                        {/* 使用提取的 isAdmin 判斷 */}
                                        {isAdmin && (
                                            <>
                                                <Link href={route('admin.orders.index')} className="block px-4 py-2 text-sm text-pink-600 font-bold hover:bg-pink-50" onClick={() => setIsDropdownOpen(false)}>
                                                    後台訂單管理
                                                </Link>
                                                <Link href={route('admin.products.index')} className="block px-4 py-2 text-sm text-pink-600 font-bold hover:bg-pink-50" onClick={() => setIsDropdownOpen(false)}>
                                                    後台商品管理
                                                </Link>
                                                <div className="border-t border-gray-100 my-1"></div>
                                            </>
                                        )}
                                        <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700" onClick={() => setIsDropdownOpen(false)}>
                                            個人資料設定
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <Link href="/member/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700" onClick={() => setIsDropdownOpen(false)}>
                                            我的訂單
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <Link href="/logout" method="post" as="button" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700">
                                            登出
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition">登入</Link>
                                <Link href="/register" className="text-sm font-medium bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition">註冊</Link>
                            </div>
                        )}
                    </div>

                    {/* 手機版漢堡按鈕 */}
                    <div className="flex items-center md:hidden space-x-4">
                        <Link href="/cart" className="relative text-gray-600 p-2" aria-label="購物車">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-600 rounded-full">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 focus:outline-none"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="開啟選單"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 手機版下拉展開選單 */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {auth?.user ? (
                            <>
                                <div className="px-3 py-2 text-sm font-bold text-gray-800 border-b border-gray-100 mb-2">Hi, {auth.user.name}</div>
                                {isAdmin && (
                                    <>
                                        {/* 🌟 核心修正：所有手機版連結都加上 onClick={closeMobileMenu} */}
                                        <Link href={route('admin.orders.index')} onClick={closeMobileMenu} className="block px-3 py-2 text-pink-600 font-bold">後台訂單管理</Link>
                                        <Link href={route('admin.products.index')} onClick={closeMobileMenu} className="block px-3 py-2 text-pink-600 font-bold">後台商品管理</Link>
                                    </>
                                )}
                                <Link href={route('profile.edit')} onClick={closeMobileMenu} className="block px-3 py-2 text-gray-700">個人資料設定</Link>
                                <Link href="/member/orders" onClick={closeMobileMenu} className="block px-3 py-2 text-gray-700">我的訂單</Link>
                                <Link href="/logout" method="post" as="button" onClick={closeMobileMenu} className="block w-full text-left px-3 py-2 text-red-600">登出</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={closeMobileMenu} className="block px-3 py-2 text-gray-700 font-medium">登入</Link>
                                <Link href="/register" onClick={closeMobileMenu} className="block px-3 py-2 text-pink-600 font-medium">註冊新帳號</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}