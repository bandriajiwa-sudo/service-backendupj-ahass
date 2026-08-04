<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SparePartReturn extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
