import React from 'react';
import { Link } from '@inertiajs/react'; // 迎賓員需要知道怎麼幫客人導覽(連結)

// 這裡的 { auth } 就是店長交給迎賓員的「顧客名單」，讓他知道客人有沒有登入
export default function Navbar({ auth }) {
    return (
        <nav className="bg-white shadow p-4 mb-6 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                    <Link href="/shop">PinkPick Demo</Link>
                </h1>

                {/* 右邊：會員狀態區 */}
                <div className="flex items-center gap-4">
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
        </nav>
    );
}