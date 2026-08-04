<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SparePartPriceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'spare_part_shipment_id',
        'harga_jual',
    ];

    public function shipment()
    {
        return $this->belongsTo(SparePartShipment::class, 'spare_part_shipment_id');
    }
}
