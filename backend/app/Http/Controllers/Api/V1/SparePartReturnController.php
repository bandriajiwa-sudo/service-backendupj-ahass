<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SparePartReturn;
use App\Models\SparePartShipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SparePartReturnController extends Controller
{
    public function index(Request $request)
    {
        $returns = SparePartReturn::with(['sparePartOrder.sparePart', 'sparePartShipment.evidences', 'createdBy', 'resolvedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 100));

        return response()->json([
            'success' => true,
            'data' => $returns->items(),
            'meta' => [
                'current_page' => $returns->currentPage(),
                'per_page' => $returns->perPage(),
                'total' => $returns->total(),
            ],
        ]);
    }

    public function show(SparePartReturn $return)
    {
        return response()->json([
            'success' => true,
            'data' => $return->load(['sparePartOrder.sparePart', 'evidences', 'sparePartShipment.evidences']),
        ]);
    }

    public function createReplacement(Request $request, SparePartReturn $return)
    {
        if ($return->status !== 'menunggu_pengiriman_ulang') {
            return response()->json([
                'success' => false,
                'message' => 'Status Return Anda tidak dapat dibalas pengiriman ulang saat ini.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $lockedReturn = SparePartReturn::where('id', $return->id)->lockForUpdate()->first();

            if ($lockedReturn->status !== 'menunggu_pengiriman_ulang') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Retur tersebut telah terlayani secara atomik oleh entitas lain.',
                ], 409);
            }

            // Membangun entitas Shipment kedua (Replacement)
            $replacementShipment = SparePartShipment::create([
                'spare_part_order_id' => $lockedReturn->spare_part_order_id,
                'shipment_type' => 'replacement',
                'quantity' => $lockedReturn->quantity,
                'harga_beli' => $lockedReturn->sparePartShipment->harga_beli,
                'harga_jual' => $lockedReturn->sparePartShipment->harga_jual,
                'status' => 'menunggu_verifikasi',
                'shipped_by' => auth()->id() ?? 1,
            ]);

            // Mutasi status Retur menjadi dikirim_ulang
            $lockedReturn->status = 'dikirim_ulang';
            $lockedReturn->resolved_by = auth()->id() ?? 1;
            $lockedReturn->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pengiriman barang ganti rugi (Replacement Shipment) sukses dipersiapkan. Mohon lengkapi fotonya.',
                'data' => $replacementShipment,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Replacement Encountered Logic Flaw: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat mencoba membangun pengiriman ulang ganti-rugi.',
            ], 500);
        }
    }
}
