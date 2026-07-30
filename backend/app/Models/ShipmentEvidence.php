<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentEvidence extends Model
{
    protected $table = 'shipment_evidences';
    protected $guarded = ['id'];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function sparePartShipment(): BelongsTo
    {
        return $this->belongsTo(SparePartShipment::class);
    }

    public function sparePartReturn(): BelongsTo
    {
        return $this->belongsTo(SparePartReturn::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
