import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import { useCart } from '@/Contexts/CartContext';

export default function ProductDetail({ product }) {
    const { addToCart } = useCart();

    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null); // 加入購物車成功的提示

    // 🌟 解析商品規格群組
    const groupedAttributes = product.attributes?.reduce((acc, attr) => {
        const groupId = attr.attribute_id;
        if (!acc[groupId]) {
            acc[groupId] = {
                name: attr.attribute?.name || `規格 ${groupId}`,
                values: []
            };
        }
        acc[groupId].values.push(attr);
        return acc;
    }, {}) || {};

    const hasAttributes = Object.keys(groupedAttributes).length > 0;

    const handleOptionChange = (attributeId, valueId) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attributeId]: Number(valueId)
        }));
        setLocalError(null);
        setSuccessMsg(null);
    };

    const handleQuantityChange = (val) => {
        let validQuantity = parseInt(val, 10);
        if (isNaN(validQuantity) || validQuantity < 1) validQuantity = 1;
        if (validQuantity > product.stock) validQuantity = product.stock;
        setQuantity(validQuantity);
        setSuccessMsg(null);
    };

    const handleAddToCart = async () => {
        setLocalError(null);
        setSuccessMsg(null);

        const requiredGroupsCount = Object.keys(groupedAttributes).length;
        const selectedGroupsCount = Object.keys(selectedOptions).length;

        if (requiredGroupsCount !== selectedGroupsCount) {
            setLocalError("請完整選擇所有商品規格");
            return;
        }

        setIsSubmitting(true);
        try {
            await addToCart(product.id, quantity, selectedOptions);
            setSuccessMsg("✅ 已成功加入購物車！");

            setQuantity(1);
        } catch (error) {
            setLocalError(error.response?.data?.message || "加入購物車失敗，請稍後再試");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head title={`${product.name} - PinkPick`} />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* 返回動線 */}
                <div className="mb-6">
                    <Link href={route('shop')} className="text-sm text-gray-500 hover:text-pink-600 transition font-medium">
                        ← 返回商城購物
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row">

                        {/* 左側：商品大圖 */}
                        <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-100 min-h-[400px]">
                            {product.image_url ? (
                                <img
                                    src={`/storage/${product.image_url}`}
                                    alt={product.name}
                                    className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-sm"
                                />
                            ) : (
                                <span className="text-gray-400 text-2xl font-bold tracking-widest">
                                    無商品圖片
                                </span>
                            )}
                        </div>

                        {/* 右側：商品資訊與購買區塊 */}
                        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                            <div className="text-sm text-pink-600 font-bold mb-2 tracking-wide uppercase">
                                {product.category?.name || '未分類'}
                            </div>

                            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

                            <div className="flex items-end gap-4 mb-6 pb-6 border-b border-gray-100">
                                <span className="text-4xl font-black text-red-600">
                                    ${Number(product.price).toLocaleString()}
                                </span>
                                <span className={`text-sm mb-1 ${product.stock > 0 ? 'text-gray-500' : 'text-red-500 font-bold'}`}>
                                    {product.stock > 0 ? `庫存餘裕: ${product.stock} 件` : '商品已售完'}
                                </span>
                            </div>

                            {/* 商品描述 */}
                            {product.description && (
                                <div className="mb-8 text-gray-600 leading-relaxed text-sm">
                                    {product.description}
                                </div>
                            )}

                            {/* 規格選擇 */}
                            {Object.entries(groupedAttributes).map(([attrId, group]) => (
                                <div key={attrId} className="mb-6">
                                    <label className="block text-sm font-bold text-gray-800 mb-3">{group.name}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {group.values.map((val) => (
                                            <button
                                                key={val.id}
                                                onClick={() => handleOptionChange(attrId, val.id)}
                                                className={`px-5 py-2.5 border-2 rounded-lg text-sm transition font-medium ${selectedOptions[attrId] === val.id
                                                    ? 'bg-pink-50 border-pink-600 text-pink-700 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600'
                                                    }`}
                                            >
                                                {val.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* 數量選擇與加入購物車 */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-800 mb-3">購買數量</label>
                                <div className="flex gap-4">
                                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden w-32">
                                        <button onClick={() => handleQuantityChange(quantity - 1)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 transition disabled:opacity-50" disabled={quantity <= 1}>−</button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(e.target.value)}
                                            className="w-full text-center border-none focus:ring-0 text-gray-800 font-bold p-0"
                                        />
                                        <button onClick={() => handleQuantityChange(quantity + 1)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 transition disabled:opacity-50" disabled={quantity >= product.stock}>+</button>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock <= 0 || isSubmitting}
                                        className={`flex-1 py-3 rounded-lg text-lg font-bold transition shadow-md ${product.stock > 0
                                            ? 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                            }`}
                                    >
                                        {isSubmitting ? '處理中...' : (product.stock > 0 ? '加入購物車' : '已售完補貨中')}
                                    </button>
                                </div>
                            </div>

                            {/* 錯誤與成功提示 */}
                            {localError && <div className="p-3 bg-red-50 text-red-600 font-medium rounded-lg text-sm border border-red-100 mb-4">{localError}</div>}
                            {successMsg && <div className="p-3 bg-green-50 text-green-700 font-medium rounded-lg text-sm border border-green-100 mb-4">{successMsg}</div>}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}