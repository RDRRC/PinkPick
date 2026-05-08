// 檔案路徑：vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    // 保留 server 區塊以確保 WSL2 穿透，但移除動態 IP
    server: {
        host: '0.0.0.0', // 允許 WSL2 外部連線
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'localhost', // 強制熱更新 WebSocket 連線回 Windows 端的 localhost
        },
        watch: {
            usePolling: true, // 保留 Polling 以防 WSL2 檔案系統監聽失效
        },
    },
});