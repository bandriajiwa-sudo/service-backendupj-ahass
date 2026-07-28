<?php

use App\Http\Controllers\Api\V1\AuthorizerController;
use App\Http\Controllers\Api\V1\LoginAccountController;
use App\Http\Controllers\Api\V1\MechanicController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SparePartController;
use App\Http\Controllers\Api\V1\SparePartOrderController;
use App\Http\Controllers\Api\V1\SparePartReceiptController;
use App\Http\Controllers\Api\V1\StockController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\DashboardController;
use Illuminate\Support\Facades\Route;

$apiRoutes = function () {
    Route::get('/debug-db', function () {
        $admin = \App\Models\Login::where('username', 'admin_dev')->first();
        return response()->json([
            'db_host' => env('DB_HOST'),
            'admin_exists' => $admin !== null,
            'password_hash' => $admin ? $admin->password : null,
            'hash_checks_out' => $admin ? \Illuminate\Support\Facades\Hash::check('password_dev_123', $admin->password) : false,
            'auth_attempt' => \Illuminate\Support\Facades\Auth::attempt(['username' => 'admin_dev', 'password' => 'password_dev_123']),
        ]);
    });

    // TEMPORARY: Run migrations on production DB
    Route::get('/run-migrate', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            return response()->json([
                'success' => true,
                'output' => \Illuminate\Support\Facades\Artisan::output(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    });

    Route::post('/authorizer/login', [AuthorizerController::class, 'login']);

    Route::middleware('auth')->group(function () {
        Route::get('/authorizer/me', [AuthorizerController::class, 'me']);
        Route::post('/authorizer/logout', [AuthorizerController::class, 'logout']);

        // Admin Specific Routes
        Route::middleware('role:admin')->group(function () {
            Route::get('/dashboard/admin/stats', [DashboardController::class, 'adminStats']);
            Route::get('/dashboard/admin/login-activity', [DashboardController::class, 'loginActivity']);

            Route::apiResource('/users', UserController::class)->except(['index']);
            Route::apiResource('/login-accounts', LoginAccountController::class);

            Route::post('/mechanics', [MechanicController::class, 'store']);
            Route::put('/mechanics/{mechanic}', [MechanicController::class, 'update']);
            Route::delete('/mechanics/{mechanic}', [MechanicController::class, 'destroy']);

            Route::post('/spare-parts', [SparePartController::class, 'store']);
            Route::put('/spare-parts/{spare_part}', [SparePartController::class, 'update']);
            Route::delete('/spare-parts/{spare_part}', [SparePartController::class, 'destroy']);

            Route::put('/stocks/{stock}/minimum', [StockController::class, 'updateMinimum']);
        });

        // Shared Mechanics Route
        Route::middleware('role:admin,front_office')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/mechanics', [MechanicController::class, 'index']);
            Route::get('/mechanics/{mechanic}', [MechanicController::class, 'show']);
        });

        // Common General Reads
        Route::middleware('role:admin,front_office,koperasi,kepala_upj')->group(function () {
            Route::get('/spare-parts', [SparePartController::class, 'index']);
            Route::get('/spare-parts/{spare_part}', [SparePartController::class, 'show']);

            Route::get('/stocks', [StockController::class, 'index']);
            Route::get('/stocks/{stock}', [StockController::class, 'show']);
        });

        // Front Office Specific Routes
        Route::middleware('role:front_office,admin')->group(function () {
            Route::get('/dashboard/fo/stats', [DashboardController::class, 'frontOfficeStats']);
            Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('/dashboard/chart', [DashboardController::class, 'chart']);
            Route::get('/dashboard/critical-stock', [DashboardController::class, 'criticalStock']);

            Route::post('/transactions', [TransactionController::class, 'store']);
            Route::get('/stocks-minimum', [StockController::class, 'minimum']); // Special minimum readout

            Route::post('/spare-part-orders', [SparePartOrderController::class, 'store']);
            Route::put('/spare-part-orders/{order}', [SparePartOrderController::class, 'update']);
            Route::delete('/spare-part-orders/{order}', [SparePartOrderController::class, 'destroy']);

            Route::patch('/spare-part-receipts/{receipt}/verification', [SparePartReceiptController::class, 'verification']);
        });

        // Koperasi Focus
        Route::middleware('role:koperasi')->group(function () {
            Route::patch('/spare-part-orders/{order}/decision', [SparePartOrderController::class, 'decision']);
            Route::post('/spare-part-receipts', [SparePartReceiptController::class, 'store']);
        });

        // Shared Transaction & Order Reads (FO & UPJ mostly)
        Route::middleware('role:front_office,kepala_upj,koperasi')->group(function () {
            Route::get('/transactions', [TransactionController::class, 'index']);
            Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
            Route::get('/transactions/{transaction}/print', [TransactionController::class, 'print']);

            Route::get('/spare-part-orders', [SparePartOrderController::class, 'index']);
            Route::get('/spare-part-orders/{order}', [SparePartOrderController::class, 'show']);

            Route::get('/spare-part-receipts', [SparePartReceiptController::class, 'index']);
            Route::get('/spare-part-receipts/{receipt}', [SparePartReceiptController::class, 'show']);
        });

        // Kepala UPJ Specific Reports & Dashboard
        Route::middleware('role:kepala_upj')->group(function () {
            Route::get('/upj/dashboard-stats', [DashboardController::class, 'upjStats']);
            Route::get('/upj/dashboard-chart', [DashboardController::class, 'chart']);

            Route::prefix('reports')->group(function () {
                Route::get('/services', [ReportController::class, 'servicesReport']);
                Route::get('/spare-parts-sales', [ReportController::class, 'sparePartSales']);
                Route::get('/stocks', [ReportController::class, 'stockStatus']);
            });
        });
    });
};

Route::prefix('api/v1')->group($apiRoutes);
Route::prefix('v1')->group($apiRoutes);
