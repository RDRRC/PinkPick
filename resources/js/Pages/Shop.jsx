// resources/js/Pages/Shop.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Pagination from '../Components/Pagination';
import FilterSidebar from '../Components/FilterSidebar';
import ProductCard from '../Components/ProductCard';

export default function Shop() {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [filters, setFilters] = useState({
        keyword: '',
        category_id: '',
        price_min: '',
        price_max: '',
        sort: 'newest'
    });
    const [errorMessage, setErrorMessage] = useState(null);

    // 🌟 優化 2：將 fetchProducts 使用 useCallback 包裝，並加入 signal 參數處理中斷
    const fetchProducts = useCallback(async (signal) => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await axios.get('/api/products', {
                params: { ...filters, page: page },
                signal: signal // 綁定中止訊號
            });

            setProducts(response.data.payload.data);
            setLastPage(response.data.payload.last_page);

        } catch (error) {
            // 🌟 核心防護：如果是因為防抖或重新發送而被取消的請求，不視為錯誤
            if (axios.isCancel(error)) {
                return;
            }

            const response = error.response;

            if (!response) {
                setErrorMessage("網路連線異常，請檢查您的網路狀態。");
                return;
            }

            const { data, status } = response;

            if (status >= 500) {
                setErrorMessage("伺服器發生異常，我們正在緊急處理中，請稍後再試。");
                return;
            }

            // 🌟 優化 3：精準捕捉 Laravel 標準的 Validation Errors 結構
            if (status === 422 && data.errors) {
                const firstErrorString = Object.values(data.errors).flat()[0];
                setErrorMessage(firstErrorString || "資料驗證失敗，請檢查輸入內容。");
            } else if (data && data.message) {
                setErrorMessage(typeof data.message === 'string' ? data.message : "發生未知錯誤。");
            } else {
                setErrorMessage("無法取得商品，發生未知錯誤。");
            }
        } finally {
            // 確保不是被取消的請求才解除 loading 狀態
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [filters, page]); // 依賴項更新時，重新生成此函數

    // 🌟 優化 1：整合 Debounce 與 API 請求中止 (AbortController)
    useEffect(() => {
        const controller = new AbortController();

        const debounceTimer = setTimeout(() => {
            fetchProducts(controller.signal);
        }, 300);

        // Cleanup Function：當 page 或 filters 改變，或是元件卸載時，清除 timer 並中止未完成的 API
        return () => {
            clearTimeout(debounceTimer);
            controller.abort();
        };
    }, [fetchProducts]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        // 🌟 優化 1：直接在事件觸發時重置頁碼，移除多餘的 useEffect，避免連鎖渲染
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="PinkPick 商城" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-start gap-6 pb-10 mt-6">
                {/* 手機版篩選按鈕 */}
                <div className="md:hidden w-full">
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="w-full bg-white text-gray-700 py-3 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 border border-gray-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        商品篩選
                    </button>
                </div>

                <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isMobileOpen={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                />

                <main className="w-full md:w-3/4">
                    {errorMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex justify-between items-center shadow-sm" role="alert">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" fillRule="evenodd"></path>
                                </svg>
                                <span className="block sm:inline">{errorMessage}</span>
                            </div>
                            <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 font-bold focus:outline-none">✕</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">載入中...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[500px]">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))
                                ) : (
                                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                                        沒有找到符合條件的商品
                                    </div>
                                )}
                            </div>

                            {products.length > 0 && (
                                <Pagination
                                    page={page}
                                    lastPage={lastPage}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}