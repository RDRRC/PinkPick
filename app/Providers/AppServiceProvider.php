<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use Illuminate\Support\Facades\URL; // 👉 1. 記得加上這行引入 URL 工具

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 👉 2. 加上這段：如果是在正式環境 (Production)，強制所有連結變成 https
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // 👇 3. 以下是專案原本的核心邏輯，絕對不能刪除！[1]
        Vite::prefetch(concurrency: 3);

        Gate::define('admin', function (User $user) {
            return $user->is_admin === true; // 改為依賴資料庫欄位
        });
    }
}
