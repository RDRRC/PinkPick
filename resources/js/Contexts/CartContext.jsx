import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // 1. 取得購物車資料 (對應 /cart/items API)
    const fetchCart = async () => {
        try {
            const response = await axios.get('/cart/items');
            const items = response.data.payload;
            setCartItems(items);

            const count = items.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        } catch (error) {
            console.error("無法取得購物車資料:", error);
        }
    };

    // 2. 加入購物車
    const addToCart = async (productId, quantity = 1, selectedAttributes = {}) => {
        try {
            const response = await axios.post('/cart/items', {
                product_id: productId,
                quantity: quantity,
                selected_attributes: selectedAttributes
            });

            await fetchCart();
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("加入購物車失敗:", error);
            throw error;
        }
    };

    // 3. 更新購物車商品數量 (PATCH)
    const updateQuantity = async (cartItemId, newQuantity) => {
        // 前端基礎防呆，避免發送小於 1 的數量
        if (newQuantity < 1) return;

        try {
            const response = await axios.patch(`/cart/items/${cartItemId}`, {
                quantity: newQuantity
            });

            // 更新成功後，重新拉取最新狀態確保資料一致性
            await fetchCart();
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("更新數量失敗:", error);
            throw error;
        }
    };

    // 4. 移除購物車商品 (DELETE)
    const removeFromCart = async (cartItemId) => {
        try {
            const response = await axios.delete(`/cart/items/${cartItemId}`);

            await fetchCart();
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("移除商品失敗:", error);
            throw error;
        }
    };

    // 監聽 SPA 路由跳轉，保持狀態同步
    useEffect(() => {
        fetchCart();

        const removeListener = router.on('success', () => {
            fetchCart();
        });

        return () => removeListener();
    }, []);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            fetchCart,
            addToCart,
            updateQuantity,
            removeFromCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}