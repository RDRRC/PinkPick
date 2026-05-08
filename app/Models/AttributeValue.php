<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $attribute_id
 * @property string $value 屬性值，例如：紅色、XL
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Attribute $attribute
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue whereAttributeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttributeValue whereValue($value)
 * @mixin \Eloquent
 */
class AttributeValue extends Model
{
    protected $fillable = ['attribute_id', 'value'];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }
}
