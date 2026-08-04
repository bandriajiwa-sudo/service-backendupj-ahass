<?php

namespace App\Models;

use App\Enums\ShipmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class SparePartShipment extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'shipped_at' => 'datetime',
        'verified_at' => 'datetime',
        'stock_posted_at' => 'datetime',
    ];

    public function sparePartOrderDetail(): BelongsTo
    {
        return $this->belongsTo(SparePartOrderDetail::class);
    }

    public function sparePartReturn(): HasOne
    {
        return $this->hasOne(SparePartReturn::class);
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(ShipmentEvidence::class);
    }

    public function shippedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shipped_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
