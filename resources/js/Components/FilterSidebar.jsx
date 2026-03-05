import React from 'react';

export default function FilterSidebar({ filters, onFilterChange }) {
    return (
        <aside className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow h-fit sticky top-24">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">商品篩選</h2>

            {/* 關鍵字搜尋 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">搜尋名稱</label>
                <input
                    type="text"
                    name="keyword"
                    value={filters.keyword}
                    onChange={onFilterChange}
                    placeholder="輸入手機、衣服..."
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
            </div>

            {/* 分類篩選 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                <select
                    name="category_id"
                    value={filters.category_id} // 確保選單顯示正確的目前狀態
                    onChange={onFilterChange}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="">所有分類</option>
                    <option value="2">手機 (ID:2)</option>
                    <option value="4">上衣 (ID:4)</option>
                </select>
            </div>

            {/* 價格範圍篩選 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">價格範圍</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        name="price_min"
                        value={filters.price_min}
                        placeholder="最低"
                        onChange={onFilterChange}
                        className="w-1/2 border-gray-300 rounded-md text-sm"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        name="price_max"
                        value={filters.price_max}
                        placeholder="最高"
                        onChange={onFilterChange}
                        className="w-1/2 border-gray-300 rounded-md text-sm"
                    />
                </div>
            </div>

            {/* 排序條件 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <select
                    name="sort"
                    value={filters.sort}
                    onChange={onFilterChange}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="newest">最新上架</option>
                    <option value="price_asc">價格：低到高</option>
                    <option value="price_desc">價格：高到低</option>
                </select>
            </div>
        </aside>
    );
}