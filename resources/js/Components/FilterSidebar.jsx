import React from 'react';

export default function FilterSidebar({ filters, onFilterChange, isMobileOpen, onClose }) {
    return (
        <>
            {/* 🌟 手機版黑色半透明遮罩 */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* 🌟 核心排版：桌機版是相對定位 (relative)，手機版變成固定定位的滑動抽屜 (fixed) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white p-6 shadow-xl transform transition-transform duration-300 overflow-y-auto
                md:relative md:translate-x-0 md:w-1/4 md:shadow md:rounded-lg md:h-fit md:sticky md:top-24 md:z-0
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-bold">商品篩選</h2>
                    {/* 🌟 手機版專用的關閉按鈕 */}
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-red-500 font-bold text-xl">✕</button>
                </div>

                {/* ... (下方的 keyword, category_id, price_min/max, sort 邏輯完全維持不變 [3-6]) ... */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">搜尋名稱</label>
                    <input type="text" name="keyword" value={filters.keyword} onChange={onFilterChange} placeholder="輸入手機、衣服..." className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                    <select name="category_id" value={filters.category_id} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm">
                        <option value="">所有分類</option>
                        <option value="2">手機 (ID:2)</option>
                        <option value="4">上衣 (ID:4)</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">價格範圍</label>
                    <div className="flex items-center gap-2">
                        <input type="number" name="price_min" value={filters.price_min} placeholder="最低" onChange={onFilterChange} className="w-1/2 border-gray-300 rounded-md text-sm" />
                        <span>-</span>
                        <input type="number" name="price_max" value={filters.price_max} placeholder="最高" onChange={onFilterChange} className="w-1/2 border-gray-300 rounded-md text-sm" />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                    <select name="sort" value={filters.sort} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm">
                        <option value="newest">最新上架</option>
                        <option value="price_asc">價格：低到高</option>
                        <option value="price_desc">價格：高到低</option>
                    </select>
                </div>

                {/* 🌟 手機版專用的確認按鈕 */}
                <button onClick={onClose} className="w-full mt-6 bg-pink-600 text-white py-2 rounded-md font-bold md:hidden">
                    查看篩選結果
                </button>
            </aside>
        </>
    );
}