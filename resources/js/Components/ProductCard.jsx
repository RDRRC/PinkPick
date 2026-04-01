import React, { useState } from 'react';
import { useCart } from '../Contexts/CartContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);

    // 【優化】：分群時同時保留規格名稱 (例如: 顏色、尺寸)
    const groupedAttributes = product.attributes?.reduce((acc, attr) => {
        const groupId = attr.attribute_id;
        if (!acc[groupId]) {
            acc[groupId] = {
                // 嘗試抓取關聯的屬性名稱，若無則顯示預設
                name: attr.attribute?.name || `規格 ${groupId}`,
                values: []
            };
        }
        acc[groupId].values.push(attr);
        return acc;
    }, {}) || {};

    const hasAttributes = Object.keys(groupedAttributes).length > 0;

    // 點擊「加入購物車」初始按鈕
    const handleInitialAdd = (e) => {
        // 【核心防護】：阻止事件冒泡，避免觸發卡片外層的 <Link>
        e.preventDefault();
        e.stopPropagation();

        if (product.stock <= 0) return;

        if (hasAttributes) {
            setIsModalOpen(true);
        } else {
            executeAddToCart({});
        }
    };

    // 選擇特定規格時的更新
    const handleOptionChange = (e, attributeId, valueId) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedOptions(prev => ({
            ...prev,
            [attributeId]: Number(valueId)
        }));
        setLocalError(null);
    };

    // 執行呼叫 API 的動作
    const executeAddToCart = async (attributesPayload) => {
        setIsSubmitting(true);
        setLocalError(null);

        try {
            await addToCart(product.id, 1, attributesPayload);
            setIsModalOpen(false);
            setSelectedOptions({});
        } catch (error) {
            const msg = error.response?.data?.message || "加入購物車失敗，請稍後再試";
            setLocalError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 彈窗內點擊「確認加入」
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

    // 關閉彈窗並阻止冒泡
    const handleCloseModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group relative flex flex-col h-full">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-gray-300 transition">
                {/* 未來可替換為真實圖片 <img src={product.image_url} ... /> */}
                Product Image
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="text-xs text-pink-600 font-bold mb-1">
                    {product.category ? product.category.name : '未分類'}
                </div>
                <h3 className="font-bold text-gray-800 truncate">{product.name}</h3>

                <div className="mt-2 flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-red-600">
                        ${Number(product.price).toLocaleString()}
                    </span>
                    <span className={`text-xs ${product.stock > 0 ? 'text-gray-500' : 'text-red-500 font-bold'}`}>
                        {product.stock > 0 ? `庫存: ${product.stock}` : '已售完'}
                    </span>
                </div>

                {/* mt-auto 確保按鈕永遠貼齊卡片底部 */}
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

            {/* --- EAV 規格選擇彈窗 (Modal) --- */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={handleCloseModal} // 點擊背景關閉
                >
                    <div
                        className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-xl relative"
                        onClick={(e) => e.stopPropagation()} // 點擊白底區域不關閉
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-gray-800">選擇商品規格</h2>
                        <p className="text-sm text-gray-500 mb-4">{product.name}</p>

                        {/* 動態渲染每一個規格群組 */}
                        {Object.entries(groupedAttributes).map(([attrId, group]) => (
                            <div key={attrId} className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {group.name}
                                </label>
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