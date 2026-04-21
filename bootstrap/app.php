<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__  . '/../routes/web.php',
        api: __DIR__  . '/../routes/api.php',
        commands: __DIR__  . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 👉 🌟 加上這行：信任所有代理伺服器 (Render 必備)
        $middleware->trustProxies(at: '*');

        // 👇 原本 Inertia 的設定，請務必保留不能刪！
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {})->create();
