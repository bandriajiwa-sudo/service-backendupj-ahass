<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\ReceiptStatus;
use App\Http\Controllers\Controller;
use App\Models\SparePartOrder;
use App\Models\SparePartReceipt;
use App\Models\SparePartStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SparePartReceiptController extends Controller
{
    public function index(Request $request)
    {
        $receipts = SparePartReceipt::with(['sparePartOrder.sparePart', 'sparePartOrder.user'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 1000));

        return response()->json([
            'success' => true,
            'data' => $receipts->items(),
            'meta' => [
                'current_page' => $receipts->currentPage(),
                'per_page' => $receipts->perPage(),
                'total' => $receipts->total(),
            ],
        ]);
    }

    public function show(SparePartReceipt $receipt)
    {
        return response()->json([
            'success' => true,
            'data' => $receipt->load('sparePartOrder.sparePart'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'spare_part_order_id' => 'required|exists:spare_part_orders,id',
            'jumlah_diterima' => 'required|integer|min:1',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $order = SparePartOrder::findOrFail($validated['spare_part_order_id']);

        if ($order->status->value !== OrderStatus::Disetujui->value) {
            return response()->json([
                'success' => false,
                'message' => 'Penerimaan hanya bisa dibuat untuk Order yang sudah disetujui Koperasi.',
            ], 422);
        }

        // Prevent multiple receipts if one already exists
        if ($order->sparePartReceipt) {
            return response()->json([
                'success' => false,
                'message' => 'DO / Penerimaan untuk order ini sudah diterbitkan sebelumnya.',
            ], 422);
        }

        $receipt = SparePartReceipt::create([
            'spare_part_order_id' => $order->id,
            'jumlah_diterima' => $validated['jumlah_diterima'],
            'harga_beli' => $validated['harga_beli'],
            'harga_jual' => $validated['harga_jual'],
            'status_verifikasi' => ReceiptStatus::Menunggu,
            'catatan' => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Informasi penerimaan telah dicatat, menunggu verifikasi lapangan oleh Front Office.',
            'data' => $receipt,
        ], 201);
    }

    public function verification(Request $request, SparePartReceipt $receipt)
    {
        $request->validate([
            'status' => ['required', Rule::enum(ReceiptStatus::class)],
            'catatan' => 'required_if:status,ditolak|nullable|string',
        ]);

        if ($receipt->status_verifikasi->value !== ReceiptStatus::Menunggu->value) {
            return response()->json([
                'success' => false,
                'message' => 'Status penerimaan ini sudah final / terverifikasi sebelumnya.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $receipt->status_verifikasi = $request->status;
            $receipt->catatan = $request->catatan;
            $receipt->tanggal_verifikasi = now();
            $receipt->save();

            // Kenaikan inventori dipicu hanya saat diverifikasi Disetujui (Diterima dengan baik)
            if ($request->status === ReceiptStatus::Disetujui->value) {
                // Lock stock for atomic increment
                $stock = SparePartStock::where('spare_part_id', $receipt->sparePartOrder->spare_part_id)
                    ->lockForUpdate()
                    ->first();
                if ($stock) {
                    $stock->stok_sekarang += $receipt->jumlah_diterima;
                    $stock->terakhir_diperbarui = now();
                    $stock->save();

                    // Cascade update the definitive selling price to the master SparePart catalog
                    $sparePart = $receipt->sparePartOrder->sparePart;
                    if ($sparePart && $receipt->harga_jual) {
                        $sparePart->harga_jual = $receipt->harga_jual;
                        $sparePart->save();
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Proses verifikasi barang sukses diselesaikan.',
                'data' => $receipt->load('sparePartOrder.sparePart'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat memproses verifikasi stok.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
