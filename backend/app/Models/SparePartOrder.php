<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SparePartOrder extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'jumlah' => 'integer',
        'status' => OrderStatus::class,
        'tanggal' => 'date',
        'tanggal_awal' => 'date',
        'tanggal_akhir' => 'date',
        'tanggal_keputusan' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
