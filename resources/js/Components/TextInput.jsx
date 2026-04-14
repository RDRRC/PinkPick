import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref
) {
    const localRef = useRef(null);

    // 保留新版 Breeze 預設的精準焦點控制邏輯
    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                // 🌟 只修改此處樣式，替換為 PinkPick 品牌色 (focus:border-pink-500, focus:ring-pink-500)
                'border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-md shadow-sm ' +
                className
            }
            ref={localRef}
        />
    );
});