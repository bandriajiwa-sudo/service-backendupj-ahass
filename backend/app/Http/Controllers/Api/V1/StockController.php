<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SparePartStock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $stocks = SparePartStock::with('sparePart')->paginate($request->query('per_page', 1000));

        return response()->json([
            'success' => true,
            'data' => $stocks->items(),
            'meta' => [
                'current_page' => $stocks->currentPage(),
                'per_page' => $stocks->perPage(),
                'total' => $stocks->total(),
            ],
        ]);
    }

    public function minimum(Request $request)
    {
        // View for FO: Get all stocks <= minimum limit
        $stocks = SparePartStock::with('sparePart')
            ->whereColumn('stok_sekarang', '<=', 'stok_minimum')
            ->paginate($request->query('per_page', 1000));

        return response()->json([
            'success' => true,
            'data' => $stocks->items(),
            'meta' => [
                'current_page' => $stocks->currentPage(),
                'per_page' => $stocks->perPage(),
                'total' => $stocks->total(),
            ],
        ]);
    }

    public function show(SparePartStock $stock)
    {
        return response()->json([
            'success' => true,
            'data' => $stock->load('sparePart'),
        ]);
    }

    public function updateMinimum(Request $request, SparePartStock $stock)
    {
        $validated = $request->validate([
            'stok_minimum' => 'required|integer|min:0',
        ]);

        $stock->update([
            'stok_minimum' => $validated['stok_minimum'],
            'terakhir_diperbarui' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Batas stok minimum berhasil diperbarui',
            'data' => $stock,
        ]);
    }
}
