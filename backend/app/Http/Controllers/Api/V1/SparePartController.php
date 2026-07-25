<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SparePartController extends Controller
{
    public function index()
    {
        $spareParts = SparePart::with('stock')->paginate(1000);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $spareParts->items(),
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
            'kategori' => 'required|string|max:100',
            'harga_jual' => 'required|numeric|min:0',
            'stok_awal' => 'sometimes|integer|min:0',
            'stok_minimum' => 'sometimes|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $sparePart = SparePart::create([
                'kode_suku_cadang' => $validated['kode_suku_cadang'],
                'nama_suku_cadang' => $validated['nama_suku_cadang'],
                'kategori' => $validated['kategori'],
                'harga_jual' => $validated['harga_jual'],
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
                'data' => $sparePart->load('stock'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat suku cadang',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(SparePart $sparePart)
    {
        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $sparePart->load('stock'),
        ]);
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'kode_suku_cadang' => 'sometimes|string|max:100|unique:spare_parts,kode_suku_cadang,' . $sparePart->id,
            'nama_suku_cadang' => 'sometimes|string|max:200',
            'kategori' => 'sometimes|string|max:100',
            'harga_jual' => 'sometimes|numeric|min:0',
            'stok_minimum' => 'sometimes|integer|min:0',
            'stok_sekarang' => 'sometimes|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $sparePart->update($request->only('kode_suku_cadang', 'nama_suku_cadang', 'kategori', 'harga_jual'));

            // Memperbarui stok jika ada request stok_sekarang atau stok_minimum
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
                'data' => $sparePart->fresh('stock'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui suku cadang',
                'error' => $e->getMessage(),
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
}
