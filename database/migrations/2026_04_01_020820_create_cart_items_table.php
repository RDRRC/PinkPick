<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            // 【優化】限制長度為 40 (Laravel Session 預設長度)，節省索引空間
            $table->string('session_id', 40)->nullable()->index();

            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);

            $table->json('selected_attributes')->nullable()->comment('格式: {"attribute_id": attribute_value_id}');

            // 【終極防禦】加入 Hash 唯一鍵，防止連點造成的重複寫入
            $table->string('item_hash', 64)->unique()->comment('防並發重複：雜湊(user/session + product + attributes)');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
