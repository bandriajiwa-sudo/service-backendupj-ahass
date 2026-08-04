<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\ShipmentEvidence;
use App\Models\SparePartOrderDetail;
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
        $shipments = SparePartShipment::with(['sparePartOrderDetail.sparePart', 'sparePartOrderDetail.sparePartOrder.user', 'shippedBy', 'verifiedBy', 'evidences'])
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
            'data' => $shipment->load(['sparePartOrderDetail.sparePart', 'sparePartOrderDetail.sparePartOrder.user', 'evidences']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'spare_part_order_id' => 'required|exists:spare_part_orders,id',
            'items' => 'required|array|min:1',
            'items.*.spare_part_order_detail_id' => 'required|exists:spare_part_order_details,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.harga_jual' => 'required|numeric|min:0',
        ]);

        $order = \App\Models\SparePartOrder::findOrFail($validated['spare_part_order_id']);

        if ($order->status->value !== OrderStatus::Disetujui->value) {
            return response()->json([
                'success' => false,
                'message' => 'Pengiriman hanya bisa dibuat untuk Order yang Surat Headers-nya sudah disetujui Koperasi.',
            ], 422);
        }

        $createdShipments = [];
        DB::beginTransaction();
        try {
            foreach ($validated['items'] as $item) {
                $orderDetail = SparePartOrderDetail::where('id', $item['spare_part_order_detail_id'])
                    ->where('spare_part_order_id', $order->id)
                    ->firstOrFail();

                // Prevent multiple initial shipments for the same order detail
                if ($orderDetail->sparePartShipments()->where('shipment_type', 'initial')->exists()) {
                    continue; // Skip if already exists
                }

                $shipment = SparePartShipment::create([
                    'spare_part_order_detail_id' => $orderDetail->id,
                    'shipment_type' => 'initial',
                    'quantity' => $item['quantity'],
                    'harga_jual' => $item['harga_jual'],
                    'status' => 'menunggu_verifikasi',
                    'shipped_by' => auth()->id() ?? 1,
                ]);

                $createdShipments[] = $shipment;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat pengiriman: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat Jalan (DO) berhasil dicatat. Silakan lengkapi dengan Bukti (Evidence).',
            'data' => $createdShipments,
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
        $path = $file->store('shipment_evidences', 'public');

        $evidence = ShipmentEvidence::create([
            'spare_part_shipment_id' => $shipment->id,
            'evidence_type' => $request->evidence_type,
            'storage_disk' => 'public',
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
        if ($evidence->storage_disk === 'public' && $evidence->storage_path) {
            if (!Storage::disk('public')->exists($evidence->storage_path)) {
                return response()->json(['success' => false, 'message' => 'Berkas S3 cloud hilang atau bucket tidak terdaftar.'], 404);
            }
            return Storage::disk('public')->download($evidence->storage_path, $evidence->original_filename);
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

    public function batchVerification(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.shipment_id' => 'required|exists:spare_part_shipments,id',
            'items.*.status' => ['required', Rule::in(['disetujui', 'ditolak'])],
            'items.*.alasan' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $returnHeaders = [];

            foreach ($request->items as $item) {
                $lockedShipment = SparePartShipment::where('id', $item['shipment_id'])->lockForUpdate()->first();

                if ($lockedShipment->status !== 'menunggu_verifikasi')
                    continue;

                if ($item['status'] === 'ditolak') {
                    $hasDamageEvidence = $lockedShipment->evidences()->where('evidence_type', 'damage_or_defect')->exists();
                    if (!$hasDamageEvidence) {
                        DB::rollBack();
                        return response()->json(['success' => false, 'message' => 'Laporan barang rusak wajib melampirkan foto bukti (Damage Evidence).'], 422);
                    }

                    $lockedShipment->status = 'ditolak';
                    $lockedShipment->rejection_note = $item['alasan'] ?? 'Barang cacat';
                    $lockedShipment->verified_by = auth()->id() ?? 1;
                    $lockedShipment->verified_at = now();
                    $lockedShipment->save();

                    $orderId = $lockedShipment->sparePartOrderDetail->spare_part_order_id;
                    if (!isset($returnHeaders[$orderId])) {
                        $returnHeaders[$orderId] = \App\Models\SparePartReturnHeader::create([
                            'nomor_tiket_retur' => 'RET-' . date('Ymd') . '-' . rand(1000, 9999),
                            'spare_part_order_id' => $orderId,
                            'status' => 'menunggu_pengiriman_ulang',
                            'created_by' => auth()->id() ?? 1,
                        ]);
                    }

                    \App\Models\SparePartReturn::create([
                        'spare_part_return_header_id' => $returnHeaders[$orderId]->id,
                        'spare_part_order_detail_id' => $lockedShipment->spare_part_order_detail_id,
                        'spare_part_shipment_id' => $lockedShipment->id,
                        'quantity' => $lockedShipment->quantity,
                        'reason' => $item['alasan'] ?? 'Barang cacat',
                    ]);
                }

                if ($item['status'] === 'disetujui') {
                    $lockedShipment->status = 'disetujui';
                    $lockedShipment->verified_by = auth()->id() ?? 1;
                    $lockedShipment->verified_at = now();
                    $lockedShipment->stock_posted_at = now();
                    $lockedShipment->save();

                    if ($lockedShipment->shipment_type === 'replacement') {
                        $returnDetail = \App\Models\SparePartReturn::where('spare_part_order_detail_id', $lockedShipment->spare_part_order_detail_id)->first();
                        if ($returnDetail && $returnDetail->sparePartReturnHeader) {
                            $returnDetail->sparePartReturnHeader->update([
                                'status' => 'selesai',
                                'resolved_by' => auth()->id() ?? 1,
                                'resolved_at' => now(),
                            ]);
                        }
                    }

                    $stock = \App\Models\SparePartStock::where('spare_part_id', $lockedShipment->sparePartOrderDetail->spare_part_id)->lockForUpdate()->first();
                    if ($stock) {
                        $stock->stok_sekarang += $lockedShipment->quantity;
                        $stock->terakhir_diperbarui = now();
                        $stock->save();
                    }
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Verifikasi massal telah selesai dieksekusi!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'SysDebug: ' . $e->getMessage()], 500);
        }
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
                    'spare_part_order_detail_id' => $lockedShipment->spare_part_order_detail_id,
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
                    SparePartReturn::where('spare_part_order_detail_id', $lockedShipment->spare_part_order_detail_id)
                        ->where('status', 'dikirim_ulang')
                        ->update([
                            'status' => 'selesai',
                            'resolved_by' => auth()->id() ?? 1,
                            'resolved_at' => now(),
                        ]);
                }

                // Row Lock Penjumlahan Inventori (P0 Idempotent)
                $stock = SparePartStock::where('spare_part_id', $lockedShipment->sparePartOrderDetail->spare_part_id)
                    ->lockForUpdate()->first();

                if ($stock) {
                    $stock->stok_sekarang += $lockedShipment->quantity;
                    $stock->terakhir_diperbarui = now();
                    $stock->save();

                    // Dihapus blok duplikasi Resolve Retur, percayakan pada blok awal saja.

                    // Pembaruan harga sekarang ditarik otomatis oleh ActivePriceService 
                    // pada saat runtime transaksi. Master data spare part tidak menyimpan histori harga.
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

    public function uploadBatchEvidences(Request $request)
    {
        $request->validate([
            'shipment_ids' => 'required|array|min:1',
            'shipment_ids.*' => 'required|exists:spare_part_shipments,id',
            'evidence_type' => ['required', Rule::in(['shipment_initial', 'damage_or_defect', 'shipment_replacement'])],
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $file = $request->file('file');
        $path = $file->store('shipment_evidences', 'public');

        $evidences = [];
        $hash = hash_file('sha256', $file->getRealPath());
        $mime = $file->getMimeType();
        $size = $file->getSize();
        $filename = $file->getClientOriginalName();

        DB::beginTransaction();
        try {
            foreach ($request->shipment_ids as $sid) {
                $evidences[] = ShipmentEvidence::create([
                    'spare_part_shipment_id' => $sid,
                    'evidence_type' => $request->evidence_type,
                    'storage_disk' => 'public',
                    'storage_path' => $path,
                    'base64_data' => null,
                    'original_filename' => $filename,
                    'mime_type' => $mime,
                    'size_bytes' => $size,
                    'sha256' => $hash,
                    'uploaded_by' => auth()->id() ?? 1,
                ]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah secara batch: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berkas bukti pengiriman masal berhasil diunggah dengan aman.',
            'data' => $evidences,
        ]);
    }
}
