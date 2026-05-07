// 檔案路徑：vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import os from 'os'; // 💡 新增：引入 Node 原生系統模組

// 💡 自動獲取 WSL2 當下的真實區域網路 IP
function getWslIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // 排除內部迴圈(localhost)並尋找 IPv4
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // 備用方案
}

const wslIp = getWslIp();

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0', // 允許 WSL2 外部連線
        port: 5173,
        strictPort: true,
        hmr: {
            // [Assumed: 強制 Laravel 渲染出的 <script> 指向 WSL2 真實 IP，徹底繞過 Windows 轉發異常]
            host: wslIp,
        },
        watch: {
            usePolling: true,
        },
    },
});