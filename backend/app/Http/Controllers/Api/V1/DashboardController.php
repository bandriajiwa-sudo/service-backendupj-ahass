<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mechanic;
use App\Models\SparePart;
use App\Models\SparePartStock;
use App\Models\Transaction;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get aggregated statistics for the Admin Dashboard.
     */
    public function adminStats(Request $request)
    {
        try {
            $usersTotal = User::count();
            $mechanicsTotal = Mechanic::count();
            $sparePartsTotal = SparePart::count();
            // Count where current stock is less than or equal to minimum threshold
            $lowStockCount = SparePartStock::whereColumn('stok_sekarang', '<=', 'stok_minimum')->count();

            // Fetch a unified activity log from recent users and transactions
            $activities = collect();

            $recentUsers = User::latest()->take(3)->get()->map(function ($u) {
                return [
                    'time' => $u->created_at->format('H:i'),
                    'activity' => 'Menambahkan pengguna: ' . $u->nama_user,
                    'user' => 'Admin',
                    'timestamp' => $u->created_at->timestamp
                ];
            });

            $recentTransactions = Transaction::latest()->take(3)->with('user')->get()->map(function ($t) {
                return [
                    'time' => $t->created_at->format('H:i'),
                    'activity' => 'Transaksi baru: ' . $t->no_transaksi,
                    'user' => $t->user ? $t->user->nama_user : 'Front Office',
                    'timestamp' => $t->created_at->timestamp
                ];
            });

            $activities = $activities->concat($recentUsers)->concat($recentTransactions)
                ->sortByDesc('timestamp')
                ->take(4)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'users_total' => $usersTotal,
                    'mechanics_total' => $mechanicsTotal,
                    'spare_parts_total' => $sparePartsTotal,
                    'low_stock_count' => $lowStockCount,
                    'recent_activities' => $activities
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get hourly login activity for the admin dashboard chart.
     */
    public function loginActivity(Request $request)
    {
        try {
            $hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
            $result = [];

            // Try to get today's login activity
            $todayLogs = LoginLog::whereDate('logged_in_at', today())->get();

            // If no activity today, show all historical data
            $logs = $todayLogs->count() > 0 ? $todayLogs : LoginLog::all();

            $hourCounts = array_fill_keys($hours, 0);

            foreach ($logs as $log) {
                $hour = $log->logged_in_at->format('H') . ':00';
                if (isset($hourCounts[$hour])) {
                    $hourCounts[$hour]++;
                }
            }

            foreach ($hours as $h) {
                $result[] = [
                    'name' => $h,
                    'aktivitas' => $hourCounts[$h],
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result,
                'period' => $todayLogs->count() > 0 ? 'today' : 'all_time',
                'total_logins' => $logs->count(),
            ]);
        } catch (\Exception $e) {
            // If table doesn't exist yet, return empty data gracefully
            $hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
            $result = array_map(fn($h) => ['name' => $h, 'aktivitas' => 0], $hours);
            return response()->json([
                'success' => true,
                'data' => $result,
                'period' => 'empty',
                'total_logins' => 0,
            ]);
        }
    }

    /**
     * Get statistics for Front Office Dashboard.
     */
    public function frontOfficeStats(Request $request)
    {
        try {
            $today = today();

            // Count today's transactions
            $transaksiHariIni = Transaction::whereDate('tanggal', $today)->count();

            // Count today's services
            $layananJasa = Transaction::whereDate('tanggal', $today)
                ->whereHas('transactionServices')
                ->count();

            // Suku cadang terjual hari ini
            $sukuCadangTerjual = \App\Models\TransactionSparePart::whereHas('transaction', function ($q) use ($today) {
                $q->whereDate('tanggal', $today);
            })->sum('jumlah');

            // Stok Minimum Critical
            $stokMinimumCount = SparePartStock::whereColumn('stok_sekarang', '<=', 'stok_minimum')->count();

            // Transaksi Terbaru
            $recentTransactions = Transaction::with(['transactionServices', 'transactionSpareParts'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($tx) {
                    $totalHarga = 0;
                    if ($tx->transactionServices) {
                        $totalHarga += $tx->transactionServices->sum('biaya_jasa');
                    }
                    if ($tx->transactionSpareParts) {
                        $totalHarga += $tx->transactionSpareParts->sum('total_harga');
                    }
                    $tx->total_jasa_part = $totalHarga;
                    return $tx;
                });

            // Suku cadang minimum
            $criticalStocks = SparePart::with('stock')
                ->whereHas('stock', function ($q) {
                    $q->whereColumn('stok_sekarang', '<=', 'stok_minimum');
                })
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'transaksiHariIni' => $transaksiHariIni,
                    'layananJasa' => $layananJasa,
                    'sukuCadangTerjual' => (int) $sukuCadangTerjual,
                    'stokMinimumCount' => $stokMinimumCount,
                    'recentTransactions' => $recentTransactions,
                    'criticalStocks' => $criticalStocks
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik front office.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for Front Office Dashboard.
     */
    public function stats(Request $request)
    {
        try {
            $today = today();

            $transaksiHariIni = Transaction::whereDate('tanggal', $today)->count();

            $layananJasa = Transaction::whereDate('tanggal', $today)
                ->whereHas('transactionServices')
                ->count();

            $sukuCadangTerjual = \App\Models\TransactionSparePart::whereHas('transaction', function ($q) use ($today) {
                $q->whereDate('tanggal', $today);
            })->sum('jumlah');

            $stokMinimumCount = SparePartStock::whereColumn('stok_sekarang', '<=', 'stok_minimum')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'transaksiHariIni' => $transaksiHariIni,
                    'layananJasa' => $layananJasa,
                    'sukuCadangTerjual' => (int) $sukuCadangTerjual,
                    'stokMinimum' => $stokMinimumCount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get financial statistics for Kepala UPJ Dashboard.
     */
    public function upjStats(Request $request)
    {
        try {
            $today = today();
            $month = today()->startOfMonth();
            $year = today()->startOfYear();

            // Helper to sum jasa and spare parts for a date scope
            $getSums = function ($queryScope) {
                return [
                    'jasa' => \App\Models\Transaction::where($queryScope)
                        ->with('transactionServices')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionServices->sum('biaya_jasa');
                        }),
                    'sukuCadang' => \App\Models\Transaction::where($queryScope)
                        ->with('transactionSpareParts')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionSpareParts->sum('total_harga');
                        })
                ];
            };

            $harian = $getSums([['tanggal', '>=', $today->startOfDay()], ['tanggal', '<=', $today->endOfDay()]]);
            $bulanan = $getSums([['tanggal', '>=', $month], ['tanggal', '<=', today()->endOfMonth()]]);
            $tahunan = $getSums([['tanggal', '>=', $year], ['tanggal', '<=', today()->endOfYear()]]);

            return response()->json([
                'success' => true,
                'data' => [
                    'jasa' => [
                        'harian' => $harian['jasa'],
                        'bulanan' => $bulanan['jasa'],
                        'tahunan' => $tahunan['jasa'],
                    ],
                    'sukuCadang' => [
                        'harian' => $harian['sukuCadang'],
                        'bulanan' => $bulanan['sukuCadang'],
                        'tahunan' => $tahunan['sukuCadang'],
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik UPJ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get critical stocks list.
     */
    public function criticalStock(Request $request)
    {
        try {
            $criticalStocks = SparePart::with('stock')
                ->whereHas('stock', function ($q) {
                    $q->whereColumn('stok_sekarang', '<=', 'stok_minimum');
                })
                ->take(15)
                ->get()
                ->map(function ($part) {
                    return [
                        'id' => $part->id,
                        'namaPart' => $part->nama_suku_cadang,
                        'stokSaatIni' => $part->stock ? $part->stock->stok_sekarang : 0,
                        'batasMinimum' => $part->stock ? $part->stock->stok_minimum : 0
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $criticalStocks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil stok kritis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chart data based on category and period.
     */
    public function chart(Request $request)
    {
        try {
            $period = $request->query('period', 'mingguan');
            $category = $request->query('category', 'all');

            $chartData = [];

            // A simplified mock response structure corresponding to the React component's expected data logic.
            // Since this is a new endpoint, we will calculate recent 7 days or mock appropriately if real complex aggregation is too heavy for now.
            // For production accuracy, we group queries by day for the last 6 days + today.

            if ($period === 'mingguan' || $period === 'harian') {
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $dateString = $date->format('Y-m-d');

                    // Sum jasa today
                    $jasaSum = Transaction::whereDate('tanggal', $dateString)
                        ->with('transactionServices')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionServices->sum('biaya_jasa');
                        });

                    // Sum spare part sales today
                    $sparepartSum = Transaction::whereDate('tanggal', $dateString)
                        ->with('transactionSpareParts')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionSpareParts->sum('total_harga');
                        });

                    $chartData[] = [
                        'label' => $date->translatedFormat('l'), // Indonesian day name if locale is set, else English
                        'jasa' => $jasaSum,
                        'spareparts' => $sparepartSum,
                    ];
                }
            } elseif ($period === 'bulanan') {
                for ($i = 3; $i >= 0; $i--) {
                    $startOfWeek = now()->subWeeks($i)->startOfWeek();
                    $endOfWeek = now()->subWeeks($i)->endOfWeek();

                    $jasaSum = Transaction::whereBetween('tanggal', [$startOfWeek, $endOfWeek])
                        ->with('transactionServices')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionServices->sum('biaya_jasa');
                        });

                    $sparepartSum = Transaction::whereBetween('tanggal', [$startOfWeek, $endOfWeek])
                        ->with('transactionSpareParts')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionSpareParts->sum('total_harga');
                        });

                    $chartData[] = [
                        'label' => 'Mg ' . (4 - $i),
                        'jasa' => $jasaSum,
                        'spareparts' => $sparepartSum,
                    ];
                }
            } elseif ($period === 'tahunan') {
                for ($i = 11; $i >= 0; $i--) {
                    $date = now()->subMonths($i);
                    $monthString = $date->format('m');
                    $yearString = $date->format('Y');

                    $jasaSum = Transaction::whereMonth('tanggal', $monthString)
                        ->whereYear('tanggal', $yearString)
                        ->with('transactionServices')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionServices->sum('biaya_jasa');
                        });

                    $sparepartSum = Transaction::whereMonth('tanggal', $monthString)
                        ->whereYear('tanggal', $yearString)
                        ->with('transactionSpareParts')
                        ->get()
                        ->sum(function ($tx) {
                            return $tx->transactionSpareParts->sum('total_harga');
                        });

                    $chartData[] = [
                        'label' => $date->translatedFormat('M'),
                        'jasa' => $jasaSum,
                        'spareparts' => $sparepartSum,
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $chartData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data chart',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
