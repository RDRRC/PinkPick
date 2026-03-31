import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Pagination from '../Components/Pagination';
import FilterSidebar from '../Components/FilterSidebar';
import ProductCard from '../Components/ProductCard';

export default function Shop({ auth }) {
    // 1. 原本的狀態保留
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

    // 2. 【新增】用來儲存錯誤訊息的狀態
    const [errorMessage, setErrorMessage] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setErrorMessage(null); // 【新增】發送請求前，先清空舊的錯誤訊息

        try {
            // 原本正確的 API 呼叫與參數傳遞
            const response = await axios.get('/api/products', {
                params: { ...filters, page: page }
            });
            // 原本正確的資料解析路徑 (搭配 Controller 的 sendResponse payload)
            setProducts(response.data.payload.data);
            setLastPage(response.data.payload.last_page);

        } catch (error) {
            const response = error.response;

            // 如果沒有 response，通常代表網路斷線或 CORS 錯誤
            if (!response) {
                setErrorMessage("網路連線異常，請檢查您的網路狀態。");
                console.error("無法取得商品 (Network/CORS):", error);
                return;
            }

            const responseData = response.data;
            const statusCode = response.status;

            // 處理 500 系列的伺服器嚴重錯誤 (後端崩潰)
            if (statusCode >= 500) {
                setErrorMessage("伺服器發生異常，我們正在緊急處理中，請稍後再試。");
                return;
            }

            // 處理 400 系列的業務邏輯或驗證錯誤
            if (responseData && responseData.message) {
                // 防護：檢查 message 是否為陣列/物件 (例如 Laravel Validation Error)
                if (typeof responseData.message === 'object') {
                    // 攤平所有錯誤陣列，並確實取出「第一句」字串來顯示
                    const firstErrorString = Object.values(responseData.message).flat()[0];
                    setErrorMessage(firstErrorString || "資料驗證失敗，請檢查輸入內容。");
                }
                // 防護：如果是單純的字串錯誤 (例如你自訂的 "無此商品")
                else if (typeof responseData.message === 'string') {
                    setErrorMessage(responseData.message);
                }
            } else {
                // Fallback: 有 response 但沒有預期的 message 結構
                setErrorMessage("無法取得商品，發生未知錯誤。");
            }

            console.error("無法取得商品:", error);
        } finally {
            setLoading(false);
        }
    };

    // 狀態變更時重置為第一頁
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // 原本的 Debounce 防抖機制
    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(debounce);
    }, [page, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* 這裡順手幫您更新為 PinkPick */}
            <Head title="PinkPick 商城" />

            <Navbar auth={auth} />

            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-6 pb-10">
                <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <main className="w-full md:w-3/4">
                    {/* 【新增】錯誤提示橫幅 (Banner) 放在商品區塊最上方 */}
                    {errorMessage && (
                        <div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex justify-between items-center shadow-sm"
                            role="alert"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" fillRule="evenodd"></path>
                                </svg>
                                <span className="block sm:inline">{errorMessage}</span>
                            </div>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="text-red-700 hover:text-red-900 font-bold focus:outline-none"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* 以下完全保留您原本的商品渲染與分頁邏輯 */}
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
                                    <div className="col-span-3 text-center py-10 text-gray-500 bg-white rounded-lg">
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