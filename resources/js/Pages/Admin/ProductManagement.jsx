import React, { useState, useRef, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Pagination from '@/Components/Pagination';
import { Transition } from '@headlessui/react'; // 🌟 引入動畫元件實作 Toast

// 🌟 接收後端傳來的 filters
export default function ProductManagement({ products, categories, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // 🌟 新增：搜尋關鍵字狀態
    const [keyword, setKeyword] = useState(filters?.keyword || '');
    // 🌟 新增：Toast 提示訊息狀態
    const [toastMessage, setToastMessage] = useState('');
    const toastTimerRef = useRef(null);

    // 🌟 完美防護：元件卸載時自動清除未執行完的計時器
    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    const showToast = (message) => {
        setToastMessage(message);

        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }

        toastTimerRef.current = setTimeout(() => {
            setToastMessage('');
            toastTimerRef.current = null;
        }, 3000);
    };

    const { data, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        name: '',
        category_id: '',
        price: '',
        stock: '',
        description: '',
        is_active: true,
    });

    // 🌟 處理搜尋送出
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.products.index'), { keyword }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        clearErrors();
        setEditingId(product.id);
        setData({
            name: product.name,
            category_id: product.category_id || '',
            price: product.price,
            stock: product.stock,
            description: product.description || '',
            is_active: Boolean(product.is_active),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            // 🌟 加入 onSuccess 回饋
            put(route('admin.products.update', editingId), {
                onSuccess: () => {
                    closeModal();
                    showToast('✅ 商品修改成功！');
                }
            });
        } else {
            // 🌟 加入 onSuccess 回饋
            post(route('admin.products.store'), {
                onSuccess: () => {
                    closeModal();
                    showToast('✅ 新商品已成功上架！');
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('確定要刪除這個商品嗎？此操作無法還原。')) {
            // 🌟 加入 onSuccess 回饋
            destroy(route('admin.products.destroy', id), {
                onSuccess: () => showToast('🗑️ 商品已成功刪除！')
            });
        }
    };

    // 🌟 保留搜尋條件的換頁邏輯
    const handlePageChange = (newPage) => {
        router.get(route('admin.products.index'), { page: newPage, keyword }, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 relative">
            <Head title="後台商品管理 - PinkPick" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* 🌟 頂部搜尋列與新增按鈕區塊 */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">📦 後台管理：商品維護</h1>

                    <div className="flex w-full sm:w-auto items-center gap-3">
                        {/* 搜尋表單 */}
                        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="搜尋商品名稱..."
                                className="border-gray-300 rounded-l-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-sm w-full sm:w-64"
                            />
                            <button type="submit" className="bg-gray-100 border border-l-0 border-gray-300 text-gray-600 px-4 py-2 rounded-r-md hover:bg-gray-200 transition text-sm font-medium">
                                搜尋
                            </button>
                        </form>

                        <button
                            onClick={openCreateModal}
                            className="bg-pink-600 text-white px-4 py-2 rounded-md font-bold hover:bg-pink-700 transition shadow-sm whitespace-nowrap"
                        >
                            + 新增商品
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* ... thead 保持不變 ... */}
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold border-b">ID / 名稱</th>
                                    <th className="px-6 py-4 font-bold border-b">分類</th>
                                    <th className="px-6 py-4 font-bold border-b">價格</th>
                                    <th className="px-6 py-4 font-bold border-b">庫存</th>
                                    <th className="px-6 py-4 font-bold border-b">狀態</th>
                                    <th className="px-6 py-4 font-bold border-b text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            找不到符合「{keyword}」的商品。
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-400">#{product.id}</div>
                                                <div className="font-bold text-gray-800">{product.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {product.category?.name || '無分類'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                ${Number(product.price).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {product.stock}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                    {product.is_active ? '上架中' : '已下架'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                                                    編輯
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 font-medium text-sm transition">
                                                    刪除
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {products.data.length > 0 && products.last_page > 1 && (
                    <div className="mt-6 pb-6">
                        <Pagination page={products.current_page} lastPage={products.last_page} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {/* 🌟 Toast 成功提示動畫 */}
            <Transition
                show={!!toastMessage}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="fixed bottom-6 right-6 z-50"
            >
                <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
                    <p className="font-medium text-sm">{toastMessage}</p>
                </div>
            </Transition>

            {/* ... Modal 表單部分完全保持你原本的寫法不變 ... */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    {/* 原本的 modal 表單 */}
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{editingId ? '編輯商品' : '新增商品'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* ... 原本的輸入框全部不變 ... */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">商品名稱 *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" required />
                                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                                        <option value="">無分類</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <div className="text-red-500 text-xs mt-1">{errors.category_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">價格 *</label>
                                    <input type="number" min="0" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" required />
                                    {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">庫存數量 *</label>
                                    <input type="number" min="0" value={data.stock} onChange={e => setData('stock', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" required />
                                    {errors.stock && <div className="text-red-500 text-xs mt-1">{errors.stock}</div>}
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-gray-300 text-pink-600 shadow-sm focus:ring-pink-500" />
                                        <span className="ml-2 text-sm text-gray-700 font-medium">上架顯示</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
                                <textarea rows="3" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"></textarea>
                                {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition font-medium">取消</button>
                                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition font-bold shadow-sm">
                                    {editingId ? '儲存修改' : '確認新增'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}