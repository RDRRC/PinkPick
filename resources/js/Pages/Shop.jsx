import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 移除原本重複的這一行: import { Head } from '@inertiajs/react';
import { Head } from '@inertiajs/react'; // 保留這一行，同時引入 Head 和 Link
import Navbar from '../Components/Navbar'; // 🌟 新增這行：把迎賓員請過來！
import Pagination from '../Components/Pagination'; // 🌟 新增這行：匯入分頁組件
import FilterSidebar from '../Components/FilterSidebar'; // 🌟 匯入篩選器組件
import ProductCard from '../Components/ProductCard'; // 🌟 匯入商品卡片組件

export default function Shop({ auth }) {
    // 定義狀態
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 新增：分頁狀態 ---
    const [page, setPage] = useState(1);       // 目前頁碼
    const [lastPage, setLastPage] = useState(1); // 總頁數

    // 篩選條件
    const [filters, setFilters] = useState({
        keyword: '',
        category_id: '',
        price_min: '',
        price_max: '',
        sort: 'newest'
    });

    // 取得商品資料
    const fetchProducts = async () => {
        setLoading(true);
        try {
            // 將 page 參數加入請求
            const response = await axios.get('/api/products', {
                params: { ...filters, page: page }
            });

            // Laravel 的 paginate() 回傳結構：data (商品), meta (分頁資訊)
            // Axios 的 response.data 才是 Laravel 回傳的完整 JSON
            setProducts(response.data.data);

            // 更新總頁數 (從 Laravel 回傳的 last_page 取得)
            setLastPage(response.data.last_page);

        } catch (error) {
            console.error("無法取得商品:", error);
        } finally {
            setLoading(false);
        }
    };

    // 監聽：當 filters 改變時 -> 重置回第 1 頁 (並觸發 fetch)
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // 監聽：當 page 改變時 -> 抓取新資料
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

    // 換頁處理
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Momo 商城" />

            {/* 🌟 店長把顧客名單 (auth) 交給迎賓員，讓他去處理門口的事 */}
            <Navbar auth={auth} />

            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-6 pb-10">

                {/* 左側篩選欄 */}
                {/* 🌟 呼叫篩選員，並交給他目前的條件(filters)和對講機(handleFilterChange) */}
                <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* 右側商品牆 */}
                <main className="w-full md:w-3/4">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">載入中...</div>
                    ) : (
                        <>
                            {/* 這裡保留了外層的 grid 設定，確保排版不會亂掉 */}
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

                            {/* --- 分頁按鈕原封不動保留在這裡 --- */}
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