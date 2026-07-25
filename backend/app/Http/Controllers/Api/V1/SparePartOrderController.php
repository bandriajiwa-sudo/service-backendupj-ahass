<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\SparePartOrder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SparePartOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = SparePartOrder::with(['user', 'sparePart'])->orderBy('created_at', 'desc')->paginate($request->query('per_page', 1000));

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
            'data' => $sparePartOrder->load(['user', 'sparePart', 'sparePartReceipt']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'spare_part_id' => 'required|exists:spare_parts,id',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        $order = SparePartOrder::create([
            'user_id' => $request->user()->user->id,
            'spare_part_id' => $validated['spare_part_id'],
            'jumlah' => $validated['jumlah'],
            'status' => OrderStatus::Menunggu,
            'catatan_fo' => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order logistik berhasil dibuat, menunggu persetujuan Koperasi.',
            'data' => $order,
        ], 201);
    }

    public function decision(Request $request, SparePartOrder $order)
    {
        $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'catatan' => 'required_if:status,ditolak|nullable|string',
        ]);

        $updateData = [
            'status' => $request->status,
            'tanggal_keputusan' => now(),
        ];

        // Hanya overwrite catatan_koperasi jika Koperasi mengirim alasan (biasanya saat ditolak)
        if ($request->filled('catatan')) {
            $updateData['catatan_koperasi'] = $request->catatan;
        }

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Keputusan order berhasil disimpan.',
            'data' => $order,
        ]);
    }

    public function update(Request $request, SparePartOrder $order)
    {
        // Only allow editing orders that are still pending
        if ($order->status->value !== OrderStatus::Menunggu->value) {
            return response()->json([
                'success' => false,
                'message' => 'Order yang sudah diproses tidak bisa diedit.',
            ], 422);
        }

        $validated = $request->validate([
            'spare_part_id' => 'sometimes|exists:spare_parts,id',
            'jumlah' => 'sometimes|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        $updateData = [];
        if (isset($validated['spare_part_id']))
            $updateData['spare_part_id'] = $validated['spare_part_id'];
        if (isset($validated['jumlah']))
            $updateData['jumlah'] = $validated['jumlah'];
        if (array_key_exists('catatan', $validated))
            $updateData['catatan_fo'] = $validated['catatan'];

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil diperbarui.',
            'data' => $order->fresh(['user', 'sparePart']),
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
