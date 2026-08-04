<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Services\ActivePriceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SparePartController extends Controller
{
    public function index()
    {
        $spareParts = SparePart::with(['stock', 'category'])->paginate(1000);

        $items = collect($spareParts->items());
        $sparePartIds = $items->pluck('id')->toArray();
        $activePrices = ActivePriceService::getActivePrices($sparePartIds);

        $items = $items->map(function ($sp) use ($activePrices) {
            $sp->harga_aktif = $activePrices[$sp->id] ?? null;
            return $sp;
        });

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $items,
            'meta' => [
                'current_page' => $spareParts->currentPage(),
                'per_page' => $spareParts->perPage(),
                'total' => $spareParts->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_suku_cadang' => 'required|string|max:100|unique:spare_parts,kode_suku_cadang',
            'nama_suku_cadang' => 'required|string|max:200',
            'category_id' => 'required|exists:categories,id',
            'satuan' => 'required|string|max:50',
            'stok_awal' => 'sometimes|integer|min:0',
            'stok_minimum' => 'sometimes|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $sparePart = SparePart::create([
                'kode_suku_cadang' => $validated['kode_suku_cadang'],
                'nama_suku_cadang' => $validated['nama_suku_cadang'],
                'category_id' => $validated['category_id'],
                'satuan' => $validated['satuan'],
            ]);

            $sparePart->stock()->create([
                'stok_sekarang' => $validated['stok_awal'] ?? 0,
                'stok_minimum' => $validated['stok_minimum'] ?? 0,
                'terakhir_diperbarui' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Master suku cadang berhasil dibuat',
                'data' => $sparePart->load(['stock', 'category']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat suku cadang',
            ], 500);
        }
    }

    public function show(SparePart $sparePart)
    {
        $sparePart->harga_aktif = ActivePriceService::getActivePrice($sparePart->id);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $sparePart->load(['stock', 'category']),
        ]);
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'kode_suku_cadang' => 'sometimes|string|max:100|unique:spare_parts,kode_suku_cadang,' . $sparePart->id,
            'nama_suku_cadang' => 'sometimes|string|max:200',
            'category_id' => 'sometimes|exists:categories,id',
            'satuan' => 'sometimes|string|max:50',
            'stok_minimum' => 'sometimes|integer|min:0',
            'stok_sekarang' => 'sometimes|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $sparePart->update($request->only('kode_suku_cadang', 'nama_suku_cadang', 'category_id', 'satuan'));

            $stockUpdates = [];
            if ($request->has('stok_minimum')) {
                $stockUpdates['stok_minimum'] = $validated['stok_minimum'];
            }
            if ($request->has('stok_sekarang')) {
                $stockUpdates['stok_sekarang'] = $validated['stok_sekarang'];
            }

            if (!empty($stockUpdates)) {
                $sparePart->stock()->update($stockUpdates);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Suku cadang berhasil diperbarui',
                'data' => $sparePart->fresh(['stock', 'category']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui suku cadang',
            ], 500);
        }
    }

    public function destroy(SparePart $sparePart)
    {
        $sparePart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Suku cadang berhasil dihapus',
        ]);
    }

    public function updatePrice(Request $request, SparePart $sparePart)
    {
        // 1. Validate the price constraint
        $validated = $request->validate([
            'harga_jual' => 'required|numeric|min:0',
        ]);

        $newPrice = $validated['harga_jual'];

        DB::beginTransaction();
        try {
            // 2. Find the latest verified shipment to attach the price log/update
            $latestShipment = \App\Models\SparePartShipment::where('status', 'disetujui')
                ->whereNotNull('verified_at')
                ->whereNotNull('harga_jual')
                ->whereHas('sparePartOrderDetail', function ($q) use ($sparePart) {
                    $q->where('spare_part_id', $sparePart->id);
                })
                ->orderByDesc('verified_at')
                ->orderByDesc('id')
                ->first();

            if (!$latestShipment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ditemukan history penerimaan/shipment untuk suku cadang ini. Harga jual tidak dapat diedit.',
                ], 400);
            }

            // 3. Log the old price
            \App\Models\SparePartPriceLog::create([
                'spare_part_shipment_id' => $latestShipment->id,
                'harga_jual' => $latestShipment->harga_jual,
            ]);

            // 4. Set the active newest price on the target shipment
            $latestShipment->update([
                'harga_jual' => $newPrice,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Harga jual suku cadang berhasil diupdate',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengedit harga: ' . $e->getMessage(),
            ], 500);
        }
    }
}
