<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\SparePartStock;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['user'])->orderBy('tanggal', 'desc')->paginate(1000);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'transactionServices.mechanic', 'transactionSpareParts.sparePart']);

        $total_jasa = $transaction->transactionServices->sum('biaya_jasa');
        $total_spare_part = $transaction->transactionSpareParts->sum('total_harga');

        return response()->json([
            'success' => true,
            'data' => $transaction,
            'summary' => [
                'total_jasa' => $total_jasa,
                'total_spare_part' => $total_spare_part,
                'grand_total' => $total_jasa + $total_spare_part,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'tanggal' => 'required|date',
            'no_nota' => 'required|string|unique:transactions,no_nota',
            'services' => 'sometimes|array',
            'services.*.mechanic_id' => 'required_with:services|exists:mechanics,id',
            'services.*.nama_jasa' => 'required_with:services|string',
            'services.*.biaya_jasa' => 'required_with:services|numeric|min:0',
            'services.*.keterangan_jasa' => 'nullable|string',
            'spare_parts' => 'sometimes|array',
            'spare_parts.*.spare_part_id' => 'required_with:spare_parts|exists:spare_parts,id',
            'spare_parts.*.jumlah' => 'required_with:spare_parts|integer|min:1',
        ]);

        if (empty($validated['services']) && empty($validated['spare_parts'])) {
            throw ValidationException::withMessages([
                'items' => 'Transaksi harus memiliki minimal 1 jasa atau 1 suku cadang.',
            ]);
        }

        DB::beginTransaction();
        try {
            // Create Transaction Header
            $transaction = Transaction::create([
                'user_id' => $validated['user_id'] ?? $request->user()->user->id, // Use provided user_id or fallback to current
                'tanggal' => $validated['tanggal'],
                'no_nota' => $validated['no_nota'],
            ]);

            // Map and Create Services
            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $svc) {
                    $transaction->transactionServices()->create([
                        'mechanic_id' => $svc['mechanic_id'],
                        'nama_jasa' => $svc['nama_jasa'],
                        'biaya_jasa' => $svc['biaya_jasa'],
                        'keterangan_jasa' => $svc['keterangan_jasa'] ?? null,
                    ]);
                }
            }

            // Map and Apply Spare Part deductions
            if (!empty($validated['spare_parts'])) {
                foreach ($validated['spare_parts'] as $sp_req) {
                    $stock = SparePartStock::where('spare_part_id', $sp_req['spare_part_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$stock || $stock->stok_sekarang < $sp_req['jumlah']) {
                        throw ValidationException::withMessages([
                            'spare_parts' => "Stok untuk Suku Cadang ID {$sp_req['spare_part_id']} tidak mencukupi (Tersedia: " . ($stock->stok_sekarang ?? 0) . ').',
                        ]);
                    }

                    // Snapshot the selling price
                    $spMaster = SparePart::find($sp_req['spare_part_id']);
                    $harga_satuan = $spMaster->harga_jual;
                    $total_harga = $harga_satuan * $sp_req['jumlah'];

                    // Deduct stock
                    $stock->stok_sekarang -= $sp_req['jumlah'];
                    $stock->terakhir_diperbarui = now();
                    $stock->save();

                    // Create log detail
                    $transaction->transactionSpareParts()->create([
                        'spare_part_id' => $sp_req['spare_part_id'],
                        'jumlah' => $sp_req['jumlah'],
                        'harga_satuan' => $harga_satuan,
                        'total_harga' => $total_harga,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data' => $transaction->load(['transactionServices', 'transactionSpareParts']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            if ($e instanceof ValidationException) {
                throw $e;
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses transaksi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
