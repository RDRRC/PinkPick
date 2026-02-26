<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        // 1. 清空舊資料 (避免重複執行時資料爆炸)
        // 注意：有外鍵約束，需依序刪除或暫時關閉檢查
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Product::truncate();
        Category::truncate();
        Attribute::truncate();
        AttributeValue::truncate();
        DB::table('product_attribute_value')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. 建立屬性 (Attributes)
        $attrBrand = Attribute::create(['name' => '品牌']);
        $attrRam = Attribute::create(['name' => '記憶體']); // For 3C
        $attrSize = Attribute::create(['name' => '尺寸']);   // For Clothes

        // 3. 建立屬性值 (Attribute Values)
        // 3C 品牌
        $valApple = $attrBrand->values()->create(['value' => 'Apple']);
        $valSamsung = $attrBrand->values()->create(['value' => 'Samsung']);
        // 記憶體
        $val8G = $attrRam->values()->create(['value' => '8GB']);
        $val16G = $attrRam->values()->create(['value' => '16GB']);
        // 衣服尺寸
        $valM = $attrSize->values()->create(['value' => 'M']);
        $valL = $attrSize->values()->create(['value' => 'L']);

        // 4. 建立分類 (Categories)
        $catElectronics = Category::create(['name' => '3C數位']);
        $catPhone = Category::create(['name' => '手機', 'parent_id' => $catElectronics->id]);
        
        $catFashion = Category::create(['name' => '流行服飾']);
        $catShirt = Category::create(['name' => '上衣', 'parent_id' => $catFashion->id]);

        // 5. 產生商品：手機 (50支)
        for ($i = 1; $i <= 50; $i++) {
            $price = rand(20000, 50000);
            $product = Product::create([
                'name' => '智慧型手機 ' . $i . '代', // 這裡注意：原本 migration 是 name 還是 title? 請確認
                'price' => $price,
                'stock' => 100,
                'category_id' => $catPhone->id,
                'description' => '這是一支非常棒的手機',
                'is_active' => true,
            ]);

            // 隨機綁定屬性 (iPhone 16GB 或 Samsung 8GB)
            $brand = (rand(0, 1) == 1) ? $valApple : $valSamsung;
            $ram = (rand(0, 1) == 1) ? $val16G : $val8G;

            // 寫入關聯表
            $product->attributes()->attach([$brand->id, $ram->id]);
        }

        // 6. 產生商品：衣服 (30件)
        for ($i = 1; $i <= 30; $i++) {
            $product = Product::create([
                'name' => '潮流T-Shirt ' . $i,
                'price' => rand(500, 2000),
                'stock' => 200,
                'category_id' => $catShirt->id,
                'description' => '純棉舒適',
                'is_active' => true,
            ]);

            $size = (rand(0, 1) == 1) ? $valM : $valL;
            $product->attributes()->attach([$size->id]);
        }
    }
}