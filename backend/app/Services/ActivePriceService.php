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
            ->whereHas('sparePartOrderDetail', function ($q) use ($sparePartId) {
                $q->where('spare_part_id', $sparePartId);
            })
            ->orderByDesc('verified_at')
            ->orderByDesc('id')
            ->first();

        if ($shipment && $shipment->harga_jual) {
            return $shipment->harga_jual;
        }

        // Fallback ke harga_jual di tabel master jika tidak ada histori DO
        $sparePart = \App\Models\SparePart::find($sparePartId);
        return $sparePart?->harga_jual;
    }

    /**
     * Ambil harga aktif untuk banyak suku cadang sekaligus (batch).
     * Return: [spare_part_id => harga_jual]
     */
    public static function getActivePrices(array $sparePartIds): array
    {
        $prices = [];
        if (empty($sparePartIds)) {
            return $prices;
        }

        $shipments = SparePartShipment::select('spare_part_order_details.spare_part_id', 'spare_part_shipments.harga_jual')
            ->join('spare_part_order_details', 'spare_part_shipments.spare_part_order_detail_id', '=', 'spare_part_order_details.id')
            ->whereIn('spare_part_order_details.spare_part_id', $sparePartIds)
            ->where('spare_part_shipments.status', 'disetujui')
            ->whereNotNull('spare_part_shipments.verified_at')
            ->whereNotNull('spare_part_shipments.harga_jual')
            ->orderBy('spare_part_shipments.verified_at', 'asc')
            ->orderBy('spare_part_shipments.id', 'asc')
            ->get();

        // The query orders ascending, so the last assignment will be the latest record
        foreach ($shipments as $s) {
            $prices[$s->spare_part_id] = $s->harga_jual;
        }

        // Cari tahu mana yang tidak memiliki histori DO
        $missingIds = array_diff($sparePartIds, array_keys($prices));
        if (!empty($missingIds)) {
            $masterParts = \App\Models\SparePart::whereIn('id', $missingIds)->get(['id', 'harga_jual']);
            foreach ($masterParts as $part) {
                if ($part->harga_jual !== null) {
                    $prices[$part->id] = $part->harga_jual;
                }
            }
        }

        return $prices;
    }
}
