<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 🌟 追加 phone 與 address 欄位，設定為 nullable (允許為空)
            // 因為舊會員或是剛註冊的會員可能還沒填寫這些資料
            $table->string('phone', 20)->nullable()->comment('常用聯絡電話')->after('email');
            $table->string('address')->nullable()->comment('常用收件地址')->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 🌟 復原時刪除這兩個欄位
            $table->dropColumn(['phone', 'address']);
        });
    }
};
