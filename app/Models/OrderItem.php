<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'selected_attributes'
    ];

    protected $casts = [
        'selected_attributes' => 'array',
    ];

    // 👇 新增這個關聯方法
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
