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
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('屬性名稱，例如：顏色、尺寸');
            // 補上與 Model 對應的 is_filterable 欄位，預設為 true (可篩選) 或 false 均可
            $table->boolean('is_filterable')->default(true)->comment('是否作為前端篩選條件');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};
