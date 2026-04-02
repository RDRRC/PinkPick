import React from 'react';
import { Head, Link } from '@inertiajs/react';
// 修正：使用現有的相對路徑
import Navbar from '../Components/Navbar';

export default function OrderSuccess({ order }) {
    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            <Head title="結帳成功 - PinkPick" />
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 mt-16 text-center">
                <div className="bg-white rounded-lg shadow-sm p-12">
                    <div className="text-6xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">感謝您的購買！</h1>
                    <p className="text-gray-600 text-lg mb-8">
                        您的訂單已經成功建立。訂單編號為：<br />
                        <span className="text-pink-600 font-bold text-2xl mt-2 block">
                            {order.order_number}
                        </span>
                    </p>

                    <div className="flex justify-center gap-4">
                        {/* 修正：使用字串路徑代替 route() helper */}
                        <Link href="/shop" className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition">
                            繼續購物
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}