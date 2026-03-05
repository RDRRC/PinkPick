import React from 'react';

// 接收店長傳來的一個「商品 (product)」資料
export default function ProductCard({ product }) {
    return (
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-gray-300 transition">
                Product Image
            </div>
            <div className="p-4">
                <div className="text-xs text-pink-600 font-bold mb-1">
                    {product.category ? product.category.name : '未分類'}
                </div>
                <h3 className="font-bold text-gray-800 truncate">{product.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-red-600">
                        ${Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">庫存: {product.stock}</span>
                </div>
                <button className="mt-3 w-full bg-pink-600 text-white py-2 rounded text-sm hover:bg-pink-700 transition">
                    加入購物車
                </button>
            </div>
        </div>
    );
}