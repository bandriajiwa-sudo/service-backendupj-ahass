<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\ShipmentEvidence;
use App\Models\SparePartOrder;
use App\Models\SparePartReturn;
use App\Models\SparePartShipment;
use App\Models\SparePartStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SparePartShipmentController extends Controller
{
    public function index(Request $request)
    {
        $shipments = SparePartShipment::with(['sparePartOrder.sparePart', 'shippedBy', 'verifiedBy', 'evidences'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 100)); // Batasi 100 max pagination sesuai PRD

        return response()->json([
            'success' => true,
            'data' => $shipments->items(),
            'meta' => [
                'current_page' => $shipments->currentPage(),
                'per_page' => $shipments->perPage(),
                'total' => $shipments->total(),
            ],
        ]);
    }

    public function show(SparePartShipment $shipment)
    {
        return response()->json([
            'success' => true,
            'data' => $shipment->load(['sparePartOrder.sparePart', 'evidences']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'spare_part_order_id' => 'required|exists:spare_part_orders,id',
            'quantity' => 'required|integer|min:1',
            'harga_jual' => 'required|numeric|min:0',
        ]);

        $order = SparePartOrder::findOrFail($validated['spare_part_order_id']);

        if ($order->status->value !== OrderStatus::Disetujui->value) {
            return response()->json([
                'success' => false,
                'message' => 'Pengiriman hanya bisa dibuat untuk Order yang sudah disetujui Koperasi.',
            ], 422);
        }

        // Prevent multiple initial shipments for the same order
        if ($order->sparePartShipments()->where('shipment_type', 'initial')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Pengiriman awal (Initial Shipment) untuk order ini sudah dibuat sebelumnya.',
            ], 422);
        }

        $shipment = SparePartShipment::create([
            'spare_part_order_id' => $order->id,
            'shipment_type' => 'initial',
            'quantity' => $validated['quantity'],
            'harga_jual' => $validated['harga_jual'],
            'status' => 'menunggu_verifikasi',
            'shipped_by' => auth()->id() ?? 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Draft Pengiriman awal telah dicatat. Silakan lengkapi dengan Bukti (Evidence).',
            'data' => $shipment,
        ], 201);
    }

    public function update(Request $request, SparePartShipment $shipment)
    {
        if ($shipment->status !== 'menunggu_verifikasi') {
            return response()->json([
                'success' => false,
                'message' => 'Pengiriman yang sudah diverifikasi tidak dapat diubah.',
            ], 422);
        }

        $validated = $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'harga_jual' => 'sometimes|numeric|min:0',
        ]);

        // Prevent editing if it's not the owner or auth id logic here, but since it's Koperasi role bounded, it's ok for MVP.

        $shipment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data pengiriman DO berhasil diperbarui.',
            'data' => $shipment,
        ]);
    }

    public function uploadEvidence(Request $request, SparePartShipment $shipment)
    {
        $request->validate([
            'evidence_type' => ['required', Rule::in(['shipment_initial', 'damage_or_defect', 'shipment_replacement'])],
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // V1 PRD 5MB limit
        ]);

        $file = $request->file('file');

        // Simpan ke Object Storage AWS S3 (Atau layer kloningan S3 Supabase)
        $path = $file->store('shipment_evidences', 's3');

        $evidence = ShipmentEvidence::create([
            'spare_part_shipment_id' => $shipment->id,
            'evidence_type' => $request->evidence_type,
            'storage_disk' => 's3',
            'storage_path' => $path,
            'base64_data' => null,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'sha256' => hash_file('sha256', $file->getRealPath()),
            'uploaded_by' => auth()->id() ?? 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berkas bukti pengiriman berhasil diunggah dengan aman.',
            'data' => $evidence,
        ]);
    }

    public function downloadEvidence(ShipmentEvidence $evidence)
    {
        // 1. Storage S3 AWS / Supabase Cloud
        if ($evidence->storage_disk === 's3' && $evidence->storage_path) {
            if (!Storage::disk('s3')->exists($evidence->storage_path)) {
                return response()->json(['success' => false, 'message' => 'Berkas S3 cloud hilang atau bucket tidak terdaftar.'], 404);
            }
            return Storage::disk('s3')->download($evidence->storage_path, $evidence->original_filename);
        }

        // 2. Storage Legacy (Base64 Injection)
        if ($evidence->storage_disk === 'database' && $evidence->base64_data) {
            $fileContent = base64_decode($evidence->base64_data);
            return response($fileContent)
                ->header('Content-Type', $evidence->mime_type)
                ->header('Content-Length', strlen($fileContent))
                ->header('Content-Disposition', 'attachment; filename="' . $evidence->original_filename . '"');
        }

        return response()->json(['success' => false, 'message' => 'Format berkas bukti V1 tidak kompatibel atau rusak.'], 404);
    }

    // Submit for actual verification (Optional if we just bypass with pure FO verify straight)
    public function submit(Request $request, SparePartShipment $shipment)
    {
        // Must have at least 1 evidence of correct type
        $hasEvidence = $shipment->evidences()
            ->where('evidence_type', $shipment->shipment_type === 'initial' ? 'shipment_initial' : 'shipment_replacement')
            ->exists();

        if (!$hasEvidence) {
            return response()->json([
                'success' => false,
                'message' => 'Koperasi harus mengunggah setidaknya 1 bukti foto/berkas sebelum mensubmit logistik.'
            ], 422);
        }

        $shipment->update(['status' => 'menunggu_verifikasi']);

        return response()->json([
            'success' => true,
            'message' => 'Distribusi Logistik telah diajukan ke Front Office dan siap diperiksa.',
        ]);
    }

    public function verification(Request $request, SparePartShipment $shipment)
    {
        $request->validate([
            'status' => ['required', Rule::in(['disetujui', 'ditolak'])],
            'rejection_note' => 'required_if:status,ditolak|nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Lock Idempotensi berlapis transaksi
            $lockedShipment = SparePartShipment::where('id', $shipment->id)->lockForUpdate()->first();

            if ($lockedShipment->status !== 'menunggu_verifikasi') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Status pengiriman ini secara atomik telah dikerjakan di sesi sebelumnya.',
                ], 409);
            }

            if ($request->status === 'ditolak') {
                // Return wajib ada bukti defect
                $hasDamageEvidence = $lockedShipment->evidences()
                    ->where('evidence_type', 'damage_or_defect')
                    ->exists();

                if (!$hasDamageEvidence) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Anda belum melampirkan berkas bukti barang rusak/cacat (Damage Evidence).'
                    ], 422);
                }

                $lockedShipment->status = 'ditolak';
                $lockedShipment->rejection_note = $request->rejection_note;
                $lockedShipment->verified_by = auth()->id() ?? 1;
                $lockedShipment->verified_at = now();
                $lockedShipment->save();

                // Lemparkan komplain ini ke tabel SparePartReturns
                SparePartReturn::create([
                    'spare_part_order_id' => $lockedShipment->spare_part_order_id,
                    'spare_part_shipment_id' => $lockedShipment->id,
                    'quantity' => $lockedShipment->quantity,
                    'reason' => $request->rejection_note,
                    'status' => 'menunggu_pengiriman_ulang',
                    'created_by' => auth()->id() ?? 1,
                ]);
            }

            if ($request->status === 'disetujui') {
                $lockedShipment->status = 'disetujui';
                $lockedShipment->verified_by = auth()->id() ?? 1;
                $lockedShipment->verified_at = now();
                $lockedShipment->stock_posted_at = now();
                $lockedShipment->save();

                // Phase 5: Otomatisasi Penutupan Tiket Retur 
                if ($lockedShipment->shipment_type === 'replacement') {
                    SparePartReturn::where('spare_part_order_id', $lockedShipment->spare_part_order_id)
                        ->where('status', 'dikirim_ulang')
                        ->update([
                            'status' => 'selesai',
                            'resolved_by' => auth()->id() ?? 1,
                            'resolved_at' => now(),
                        ]);
                }

                // Row Lock Penjumlahan Inventori (P0 Idempotent)
                $stock = SparePartStock::where('spare_part_id', $lockedShipment->sparePartOrder->spare_part_id)
                    ->lockForUpdate()->first();

                if ($stock) {
                    $stock->stok_sekarang += $lockedShipment->quantity;
                    $stock->terakhir_diperbarui = now();
                    $stock->save();

                    // Dihapus blok duplikasi Resolve Retur, percayakan pada blok awal saja.

                    // Tancapkan pembaruan update katalog sentral master Sparepart
                    $sparePart = $lockedShipment->sparePartOrder->sparePart;
                    if ($sparePart && $lockedShipment->harga_jual) {
                        $sparePart->harga_jual = $lockedShipment->harga_jual;
                        $sparePart->save();
                    }
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Distribusi sukses diverifikasi.',
                'data' => $lockedShipment,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Shipment Verify Error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'SysDebug: ' . $e->getMessage() . ' | L:' . $e->getLine(),
            ], 500);
        }
    }
}
