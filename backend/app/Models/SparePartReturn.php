<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SparePartReturn extends Model
{
    protected $guarded = ['id'];

    public function sparePartReturnHeader(): BelongsTo
    {
        return $this->belongsTo(SparePartReturnHeader::class);
    }

    public function sparePartOrderDetail(): BelongsTo
    {
        return $this->belongsTo(SparePartOrderDetail::class);
    }

    public function sparePartShipment(): BelongsTo
    {
        return $this->belongsTo(SparePartShipment::class);
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(ShipmentEvidence::class);
    }
}
