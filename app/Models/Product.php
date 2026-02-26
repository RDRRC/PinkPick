<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // 允許大量寫入的欄位
    protected $fillable = ['name', 'description', 'price', 'stock', 'is_active', 'category_id'];

    // 關聯：多對多連接屬性值
    public function attributes()
    {
        // 這裡對應 migration 的 'product_attribute_value' 表
        // 第二個參數是中間表名稱，第三個是本表ID，第四個是對外ID
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_value', 'product_id', 'attribute_value_id');
    }
    
    // 關聯：屬於某個分類
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}