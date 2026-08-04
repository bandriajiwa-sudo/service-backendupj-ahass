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
        'status' => OrderStatus::class,
        'tanggal_pengajuan' => 'date',
        'tanggal' => 'date',
        'tanggal_awal' => 'date',
        'tanggal_akhir' => 'date',
        'tanggal_keputusan' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sparePartOrderDetails(): HasMany
    {
        return $this->hasMany(SparePartOrderDetail::class);
    }
}
