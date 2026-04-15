// 檔案路徑: resources/js/Components/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../Contexts/CartContext';
import { Link } from '@inertiajs/react';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);

    const [quantity, setQuantity] = useState(1);

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

    const handleInitialAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock <= 0) return;

        setIsModalOpen(true);
    };

    const handleOptionChange = (e, attributeId, valueId) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedOptions(prev => ({
            ...prev,
            [attributeId]: Number(valueId)
        }));
        setLocalError(null);
    };

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setQuantity('');
            return;
        }
        const parsedVal = parseInt(val, 10);
        if (!isNaN(parsedVal)) {
            setQuantity(parsedVal);
        }
    };

    const validateQuantity = () => {
        let validQuantity = parseInt(quantity, 10);
        if (isNaN(validQuantity) || validQuantity < 1) {
            validQuantity = 1;
        } else if (validQuantity > product.stock) {
            validQuantity = product.stock;
        }
        setQuantity(validQuantity);
        return validQuantity;
    };

    const executeAddToCart = async (attributesPayload) => {
        setIsSubmitting(true);
        setLocalError(null);

        const finalQuantity = validateQuantity();

        try {
            await addToCart(product.id, finalQuantity, attributesPayload);
            setIsModalOpen(false);
            setSelectedOptions({});
            setQuantity(1);
        } catch (error) {
            const msg = error.response?.data?.message || "加入購物車失敗，請稍後再試";
            setLocalError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const requiredGroupsCount = Object.keys(groupedAttributes).length;
        const selectedGroupsCount = Object.keys(selectedOptions).length;

        if (requiredGroupsCount !== selectedGroupsCount) {
            setLocalError("請完整選擇所有商品規格");
            return;
        }
        executeAddToCart(selectedOptions);
    };

    const handleCloseModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(false);
        setQuantity(1);
    };

    return (
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group relative flex flex-col h-full">
            {/* 🌟 修改 1：將圖片區塊改為可點擊的 Link */}
            {/* 🌟 視覺優化：外層加上 overflow-hidden 與 group */}
            <Link href={route('products.show', product.id)} className="block h-48 bg-gray-200 overflow-hidden group">
                {/* 🌟 內部加上 transform 與 hover:scale-105 動畫 */}
                <div className="w-full h-full flex items-center justify-center text-gray-400 transition-transform duration-300 group-hover:scale-105 group-hover:bg-gray-300">
                    Product Image
                </div>
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <div className="text-xs text-pink-600 font-bold mb-1">
                    {product.category ? product.category.name : '未分類'}
                </div>
                {/* 🌟 修改 2：將商品標題改為可點擊的 Link */}
                <h3 className="font-bold text-gray-800 truncate">
                    <Link href={route('products.show', product.id)} className="hover:text-pink-600 transition">
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-2 flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-red-600">
                        ${Number(product.price).toLocaleString()}
                    </span>
                    <span className={`text-xs ${product.stock > 0 ? 'text-gray-500' : 'text-red-500 font-bold'}`}>
                        {product.stock > 0 ? `庫存: ${product.stock}` : '已售完'}
                    </span>
                </div>

                <button
                    onClick={handleInitialAdd}
                    disabled={product.stock <= 0 || isSubmitting}
                    className={`mt-auto w-full py-2 rounded text-sm transition font-bold ${product.stock > 0
                        ? 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? '處理中...' : (product.stock > 0 ? '加入購物車' : '補貨中')}
                </button>
            </div>

            {/* 彈出視窗 Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseModal}>
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-xl relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={handleCloseModal} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold">
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            {hasAttributes ? '選擇商品規格與數量' : '確認購買數量'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">{product.name}</p>

                        {Object.entries(groupedAttributes).map(([attrId, group]) => (
                            <div key={attrId} className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{group.name}</label>
                                <div className="flex flex-wrap gap-2">
                                    {group.values.map((val) => (
                                        <button
                                            key={val.id}
                                            onClick={(e) => handleOptionChange(e, attrId, val.id)}
                                            className={`px-4 py-2 border rounded-md text-sm transition ${selectedOptions[attrId] === val.id
                                                ? 'bg-pink-600 text-white border-pink-600 font-bold'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-pink-500'
                                                }`}
                                        >
                                            {val.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">購買數量</label>
                            <input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={quantity}
                                onChange={handleQuantityChange}
                                onBlur={validateQuantity}
                                // 🔧 優化：若無規格，展開 Modal 時自動聚焦數量輸入框
                                autoFocus={!hasAttributes}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm"
                            />
                        </div>

                        {localError && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded border border-red-200">
                                {localError}
                            </div>
                        )}

                        <button
                            onClick={handleConfirmAdd}
                            disabled={isSubmitting}
                            className="w-full mt-4 bg-pink-600 text-white py-2 rounded font-bold hover:bg-pink-700 disabled:bg-pink-400"
                        >
                            {isSubmitting ? '加入中...' : '確認加入'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}