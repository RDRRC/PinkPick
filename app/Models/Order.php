<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'total_amount',
        'recipient_name',
        'recipient_email',
        'recipient_phone',
        'shipping_address',
        'status'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
