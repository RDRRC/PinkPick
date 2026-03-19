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
        Schema::create('product_attribute_value', function (Blueprint $table) {
            // 綁定商品 ID
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            // 綁定屬性值 ID
            $table->foreignId('attribute_value_id')->constrained()->cascadeOnDelete();

            // 確保同一個商品不會被重複綁定同一個屬性值
            $table->primary(['product_id', 'attribute_value_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_attribute_value');
    }
};
