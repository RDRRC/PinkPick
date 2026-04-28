<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 🌟 預設建立超級管理員帳號
        \App\Models\User::create([
            'name' => 'PinkPick 系統管理員',
            'email' => 'admin@pinkpick.com',
            'password' => bcrypt('password'), // 面試展示用預設密碼
            'is_admin' => true, // 🌟 記得手動指定這行為 true
            'email_verified_at' => now(),
        ]);

        // 👇 新增這行，讓系統自動呼叫你的商品種子檔
        $this->call([
            ShopSeeder::class,
        ]);
    }
}
