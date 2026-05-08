<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $order_number 訂單編號
 * @property int|null $user_id
 * @property numeric $total_amount 訂單總金額
 * @property string $recipient_name 收件人姓名
 * @property string $recipient_email 聯絡信箱
 * @property string $recipient_phone 聯絡電話
 * @property string $shipping_address 寄送地址
 * @property string $status 訂單狀態：pending, paid, shipped, completed, cancelled
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $items
 * @property-read int|null $items_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereOrderNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRecipientEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRecipientName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRecipientPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereShippingAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereUserId($value)
 * @mixin \Eloquent
 */
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
