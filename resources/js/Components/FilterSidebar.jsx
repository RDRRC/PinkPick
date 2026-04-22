// resources/js/Components/FilterSidebar.jsx
import React from 'react';

export default function FilterSidebar({
    filters = {}, // 增加預設空物件，避免 undefined 崩潰
    onFilterChange,
    isMobileOpen = false,
    onClose
}) {
    // 提取預設值以確保受控組件 (Controlled Components) 穩定運作
    const {
        keyword = '',
        category_id = '',
        price_min = '',
        price_max = '',
        sort = 'newest'
    } = filters;

    return (
        <>
            {/* 手機版黑色半透明遮罩 */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* 已移除 md:relative，確保 md:sticky 完美生效 */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white p-6 shadow-xl transform transition-transform duration-300 overflow-y-auto
                md:sticky md:translate-x-0 md:w-1/4 md:shadow md:rounded-lg md:h-fit md:top-24 md:z-0
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-bold">商品篩選</h2>
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-500 hover:text-red-500 font-bold text-xl"
                        aria-label="關閉篩選"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">搜尋名稱</label>
                    <input
                        type="text"
                        name="keyword"
                        value={keyword}
                        onChange={onFilterChange}
                        placeholder="輸入手機、衣服..."
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                    <select
                        name="category_id"
                        value={category_id}
                        onChange={onFilterChange}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">所有分類</option>
                        <option value="2">手機</option>
                        <option value="4">上衣</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">價格範圍</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="price_min"
                            value={price_min}
                            placeholder="最低"
                            onChange={onFilterChange}
                            className="w-1/2 border-gray-300 rounded-md text-sm"
                            min="0"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            name="price_max"
                            value={price_max}
                            placeholder="最高"
                            onChange={onFilterChange}
                            className="w-1/2 border-gray-300 rounded-md text-sm"
                            min="0"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                    <select
                        name="sort"
                        value={sort}
                        onChange={onFilterChange}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="newest">最新上架</option>
                        <option value="price_asc">價格：低到高</option>
                        <option value="price_desc">價格：高到低</option>
                    </select>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-pink-600 text-white py-2 rounded-md font-bold md:hidden hover:bg-pink-700 transition-colors"
                >
                    查看篩選結果
                </button>
            </aside>
        </>
    );
}