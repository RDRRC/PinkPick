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
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            // 關聯到 attributes 表。cascadeOnDelete 代表如果「顏色」被刪除，底下的「紅藍綠」也會跟著消失
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->string('value')->comment('屬性值，例如：紅色、XL');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
    }
};
