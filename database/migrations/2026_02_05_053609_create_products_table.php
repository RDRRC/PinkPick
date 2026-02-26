<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        // 這裡我們統一用 'name'，跟你的 Seeder 修正版對齊
        $table->string('name')->comment('商品名稱'); 
        $table->foreignId('category_id')->nullable(); // 記得加上這個，Seeder 有用到
        $table->decimal('price', 10, 2);
        $table->unsignedInteger('stock')->default(0);
        $table->text('description')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
