<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\SparePartOrder;
use App\Models\SparePartOrderDetail;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class SparePartOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = SparePartOrder::with(['user', 'sparePartOrderDetails.sparePart', 'sparePartOrderDetails.sparePartShipments'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 1000));

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(SparePartOrder $sparePartOrder)
    {
        return response()->json([
            'success' => true,
            'data' => $sparePartOrder->load(['user', 'sparePartOrderDetails.sparePart', 'sparePartOrderDetails.sparePartShipments']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.spare_part_id' => 'required|exists:spare_parts,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        $nomorSurat = 'ORD/' . date('Ymd') . '/' . strtoupper(Str::random(4));

        $order = SparePartOrder::create([
            'user_id' => $request->user()->user->id,
            'nomor_surat_order' => $nomorSurat,
            'tanggal_pengajuan' => now()->toDateString(),
            'status' => OrderStatus::Menunggu,
            'catatan_fo' => $validated['catatan'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            SparePartOrderDetail::create([
                'spare_part_order_id' => $order->id,
                'spare_part_id' => $item['spare_part_id'],
                'jumlah_qty' => $item['jumlah']
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat Order logistik berhasil dibuat, menunggu persetujuan Koperasi.',
            'data' => $order->load('sparePartOrderDetails'),
        ], 201);
    }

    public function decision(Request $request, SparePartOrder $order)
    {
        $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'catatan' => 'required_if:status,ditolak|nullable|string',
            'tanggal_awal' => 'nullable|required_if:status,menunggu|date',
            'tanggal_akhir' => 'nullable|required_if:status,menunggu|date|after_or_equal:tanggal_awal',
        ]);

        $updateData = [
            'status' => $request->status,
            'tanggal_keputusan' => now(),
        ];

        // Hanya overwrite catatan_koperasi jika Koperasi mengirim alasan (biasanya saat ditolak)
        if ($request->filled('catatan')) {
            $updateData['catatan_koperasi'] = $request->catatan;
        }

        if ($request->status === OrderStatus::Menunggu->value && $request->filled('tanggal_awal') && $request->filled('tanggal_akhir')) {
            $updateData['tanggal_awal'] = $request->tanggal_awal;
            $updateData['tanggal_akhir'] = $request->tanggal_akhir;
        }

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Keputusan order berhasil disimpan.',
            'data' => $order,
        ]);
    }

    public function estimate(Request $request, SparePartOrder $order)
    {
        if ($order->status->value !== OrderStatus::Menunggu->value) {
            return response()->json([
                'success' => false,
                'message' => 'Estimasi hanya bisa diisi saat order masih menunggu.',
            ], 422);
        }

        $request->validate([
            'tanggal_awal' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_awal',
        ]);

        $order->update([
            'tanggal_awal' => $request->tanggal_awal,
            'tanggal_akhir' => $request->tanggal_akhir,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estimasi ketersediaan berhasil disimpan.',
            'data' => $order,
        ]);
    }

    public function update(Request $request, SparePartOrder $order)
    {
        // Only allow editing orders that are still pending
        if ($order->status->value !== OrderStatus::Menunggu->value) {
            return response()->json([
                'success' => false,
                'message' => 'Order yang sudah direspon tidak bisa diedit.',
            ], 422);
        }

        $validated = $request->validate([
            'catatan' => 'nullable|string',
        ]);

        if (array_key_exists('catatan', $validated)) {
            $order->update(['catatan_fo' => $validated['catatan']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat Order berhasil diperbarui.',
            'data' => $order->load('sparePartOrderDetails'),
        ]);
    }

    public function destroy(SparePartOrder $order)
    {
        // Only allow deleting orders that are still pending
        if ($order->status->value !== OrderStatus::Menunggu->value) {
            return response()->json([
                'success' => false,
                'message' => 'Order yang sudah diproses tidak bisa dihapus.',
            ], 422);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dihapus.',
        ]);
    }
}
