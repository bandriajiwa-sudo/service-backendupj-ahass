<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SparePartOrderDetail extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function sparePartOrder(): BelongsTo
    {
        return $this->belongsTo(SparePartOrder::class);
    }

    public function sparePart(): BelongsTo
    {
        return $this->belongsTo(SparePart::class);
    }

    public function sparePartShipments(): HasMany
    {
        return $this->hasMany(SparePartShipment::class);
    }

    public function sparePartReturns(): HasMany
    {
        return $this->hasMany(SparePartReturn::class);
    }
}
