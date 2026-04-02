import React, { useMemo, useState } from 'react';
import axios from 'axios'; // 新增引入 axios
import { Head, Link, useForm, usePage, router } from '@inertiajs/react'; // 新增引入 router
import Navbar from '../Components/Navbar';
import { useCart } from '../Contexts/CartContext';

export default function Checkout() {
    // 這裡記得要把 fetchCart 解構出來
    const { cartItems, fetchCart } = useCart();
    const { auth } = usePage().props;

    const totalAmount = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = item.product?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    }, [cartItems]);

    const { data, setData, post, processing, errors } = useForm({
        recipient_name: auth?.user?.name || '',
        recipient_email: auth?.user?.email || '',
        recipient_phone: '',
        shipping_address: '',
    });

    const [localError, setLocalError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        try {
            const response = await axios.post('/orders', data);
            const { order_number } = response.data.payload;

            // 1. 更新全域購物車狀態 (歸零)
            await fetchCart();
            // 2. 導向至結帳成功頁面 (附帶 query string)
            router.visit(`/orders/success?order_number=${order_number}`);

        } catch (error) {
            const msg = error.response?.data?.message || "訂單送出失敗，請檢查欄位";
            setLocalError(msg);
            alert(msg);
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            <Head title="結帳 - PinkPick" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">結帳</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                        <p className="text-gray-500 text-lg mb-6">您的購物車目前沒有商品，無法結帳。</p>
                        <Link href="/shop" className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition">
                            返回商城
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* 左側：收件資訊表單 */}
                        <div className="lg:w-2/3">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">收件人資訊</h2>

                                {/* 【優化】為 form 加上 id，讓外部按鈕可以綁定 */}
                                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">收件人姓名 *</label>
                                            <input
                                                type="text"
                                                value={data.recipient_name}
                                                onChange={e => setData('recipient_name', e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                required
                                            />
                                            {errors.recipient_name && <div className="text-red-500 text-sm mt-1">{errors.recipient_name}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">聯絡信箱 *</label>
                                            <input
                                                type="email"
                                                value={data.recipient_email}
                                                onChange={e => setData('recipient_email', e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                required
                                            />
                                            {errors.recipient_email && <div className="text-red-500 text-sm mt-1">{errors.recipient_email}</div>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">聯絡電話 *</label>
                                        <input
                                            type="tel"
                                            value={data.recipient_phone}
                                            onChange={e => setData('recipient_phone', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            placeholder="0912345678"
                                            required
                                        />
                                        {errors.recipient_phone && <div className="text-red-500 text-sm mt-1">{errors.recipient_phone}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">寄送地址 *</label>
                                        <input
                                            type="text"
                                            value={data.shipping_address}
                                            onChange={e => setData('shipping_address', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            placeholder="請輸入完整收件地址"
                                            required
                                        />
                                        {errors.shipping_address && <div className="text-red-500 text-sm mt-1">{errors.shipping_address}</div>}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* 右側：訂單摘要 (Order Summary) */}
                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">訂單內容</h2>

                                <ul className="mb-6 space-y-4 max-h-64 overflow-y-auto pr-2">
                                    {cartItems.map(item => (
                                        <li key={item.id} className="flex justify-between items-center text-sm">
                                            <div className="flex-1 truncate pr-4">
                                                <span className="font-medium text-gray-800">{item.product?.name}</span>
                                                <span className="text-gray-500 ml-2">x {item.quantity}</span>
                                                {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                                    <div className="text-xs text-gray-400 mt-1 flex gap-1">
                                                        {Object.entries(item.selected_attributes).map(([attrId, valId]) => (
                                                            <span key={attrId}>[規格{attrId}:{valId}]</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-800">
                                                ${((item.product?.price || 0) * item.quantity).toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t pt-4 mt-4 flex justify-between items-center mb-6">
                                    <span className="text-lg font-bold text-gray-800">總結帳金額</span>
                                    <span className="text-3xl font-bold text-red-600">
                                        ${totalAmount.toLocaleString()}
                                    </span>
                                </div>

                                {/* 【核心優化】送出按鈕移至右側，透過 form="checkout-form" 觸發左側表單送出 */}
                                <button
                                    type="submit"
                                    form="checkout-form" // 綁定左側表單 ID
                                    disabled={processing}
                                    className="w-full bg-pink-600 text-white py-3.5 rounded-lg font-bold text-lg hover:bg-pink-700 transition shadow-md disabled:bg-pink-400"
                                >
                                    {processing ? '處理中...' : '確認送出訂單'}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}