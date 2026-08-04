<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SparePartReturnHeader;
use App\Models\SparePartReturn;
use App\Models\SparePartShipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SparePartReturnController extends Controller
{
    public function index(Request $request)
    {
        $headers = SparePartReturnHeader::with([
            'sparePartOrder',
            'createdBy',
            'resolvedBy',
            'sparePartReturns.sparePartOrderDetail.sparePart',
            'sparePartReturns.sparePartShipment.evidences'
        ])
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $headers->items(),
            'meta' => [
                'current_page' => $headers->currentPage(),
                'per_page' => $headers->perPage(),
                'total' => $headers->total(),
            ],
        ]);
    }

    public function show(SparePartReturnHeader $return)
    {
        return response()->json([
            'success' => true,
            'data' => $return->load([
                'sparePartOrder',
                'createdBy',
                'resolvedBy',
                'sparePartReturns.sparePartOrderDetail.sparePart',
                'sparePartReturns.sparePartShipment.evidences'
            ]),
        ]);
    }

    public function createReplacement(Request $request, SparePartReturnHeader $return)
    {
        if ($return->status !== 'menunggu_pengiriman_ulang') {
            return response()->json([
                'success' => false,
                'message' => 'Status Return Anda tidak dapat dibalas pengiriman ulang saat ini.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $lockedHeader = SparePartReturnHeader::where('id', $return->id)->lockForUpdate()->first();

            if ($lockedHeader->status !== 'menunggu_pengiriman_ulang') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Retur tersebut telah terlayani secara atomik oleh entitas lain.',
                ], 409);
            }

            // Membangun entitas Shipment kedua (Replacement) untuk SEMUA ITEM di dalam tiket retur ini
            $replacements = [];
            foreach ($lockedHeader->sparePartReturns as $detail) {
                $replacements[] = SparePartShipment::create([
                    'spare_part_order_detail_id' => $detail->spare_part_order_detail_id,
                    'shipment_type' => 'replacement',
                    'quantity' => $detail->quantity,
                    'harga_jual' => $detail->sparePartShipment->harga_jual,
                    'status' => 'menunggu_verifikasi',
                    'shipped_by' => auth()->id() ?? 1,
                ]);
            }

            // Mutasi status Retur menjadi dikirim_ulang
            $lockedHeader->status = 'dikirim_ulang';
            $lockedHeader->resolved_by = auth()->id() ?? 1;
            $lockedHeader->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pengiriman barang ganti rugi (Replacement Shipment) sukses dipersiapkan untuk semua item di dalam tiket.',
                'data' => $replacements,
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
