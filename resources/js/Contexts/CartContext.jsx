import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react'; // 【修正】引入 Inertia router

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // 取得購物車資料
    const fetchCart = async () => {
        try {
            const response = await axios.get('/cart');
            // 搭配 Controller 的 sendResponse，資料在 payload 裡
            const items = response.data.payload;
            setCartItems(items);

            // 計算總數量
            const count = items.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        } catch (error) {
            console.error("無法取得購物車資料:", error);
        }
    };

    // 加入購物車
    const addToCart = async (productId, quantity = 1, selectedAttributes = {}) => {
        try {
            const response = await axios.post('/cart', {
                product_id: productId,
                quantity: quantity,
                selected_attributes: selectedAttributes
            });

            // 加入成功後重新拉取
            await fetchCart();
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("加入購物車失敗:", error);
            // 將錯誤拋出，讓 UI 的 catch 區塊接手處理 (觸發階段二的紅色橫幅)
            throw error;
        }
    };

    // 【核心優化】結合 Inertia 路由監聽，解決 SPA 狀態不同步問題
    useEffect(() => {
        // 初次載入抓取
        fetchCart();

        // 監聽 Inertia 的成功跳轉事件 (包含登入、登出、換頁)
        const removeListener = router.on('success', () => {
            fetchCart();
        });

        // 組件卸載時清除監聽器，避免記憶體洩漏
        return () => removeListener();
    }, []);

    return (
        <CartContext.Provider value={{ cartItems, cartCount, fetchCart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}