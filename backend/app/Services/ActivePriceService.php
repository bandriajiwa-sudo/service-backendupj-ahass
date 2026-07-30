<?php

namespace App\Services;

use App\Models\SparePartShipment;

class ActivePriceService
{
    /**
     * Ambil harga jual aktif dari penerimaan terakhir yang disetujui
     * untuk suku cadang tertentu.
     */
    public static function getActivePrice(int $sparePartId): ?string
    {
        $shipment = SparePartShipment::where('status', 'disetujui')
            ->whereNotNull('verified_at')
            ->whereNotNull('harga_jual')
            ->whereHas('sparePartOrder', function ($q) use ($sparePartId) {
                $q->where('spare_part_id', $sparePartId);
            })
            ->orderByDesc('verified_at')
            ->orderByDesc('id')
            ->first();

        return $shipment?->harga_jual;
    }

    /**
     * Ambil harga aktif untuk banyak suku cadang sekaligus (batch).
     * Return: [spare_part_id => harga_jual]
     */
    public static function getActivePrices(array $sparePartIds): array
    {
        $prices = [];

        foreach ($sparePartIds as $id) {
            $prices[$id] = self::getActivePrice($id);
        }

        return $prices;
    }
}
