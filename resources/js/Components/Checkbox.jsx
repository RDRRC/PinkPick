export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                // 🌟 已替換為 PinkPick 品牌色 (text-pink-600, focus:ring-pink-500)
                'rounded border-gray-300 text-pink-600 shadow-sm focus:ring-pink-500 ' +
                className
            }
        />
    );
}