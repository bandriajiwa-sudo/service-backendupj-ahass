<?php

use App\Http\Controllers\Api\V1\AuthorizerController;
use App\Http\Controllers\Api\V1\LoginAccountController;
use App\Http\Controllers\Api\V1\MechanicController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\PersonnelController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SparePartController;
use App\Http\Controllers\Api\V1\SparePartOrderController;
use App\Http\Controllers\Api\V1\SparePartShipmentController;
use App\Http\Controllers\Api\V1\SparePartReturnController;
use App\Http\Controllers\Api\V1\StockController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\SparePartPriceLogController;
use App\Http\Controllers\Api\V1\UploadController;
use Illuminate\Support\Facades\Route;

$apiRoutes = function () {
    Route::post('/authorizer/login', [AuthorizerController::class, 'login'])->middleware('throttle:login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/storage/presigned-url', [UploadController::class, 'getPresignedUrl']);

        Route::get('/authorizer/me', [AuthorizerController::class, 'me']);
        Route::post('/authorizer/logout', [AuthorizerController::class, 'logout']);

        // Admin Specific Routes
        Route::middleware('role:admin')->group(function () {
            Route::get('/dashboard/admin/stats', [DashboardController::class, 'adminStats']);
            Route::get('/dashboard/admin/login-activity', [DashboardController::class, 'loginActivity']);

            Route::apiResource('/users', UserController::class)->except(['index']);
            Route::apiResource('/login-accounts', LoginAccountController::class);
            Route::apiResource('/categories', CategoryController::class);
            Route::apiResource('/personnels', PersonnelController::class);

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
            Route::get('/categories', [CategoryController::class, 'index']);

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

            Route::post('/spare-part-shipments/batch-verify', [SparePartShipmentController::class, 'batchVerification']);
            Route::patch('/spare-part-shipments/{shipment}/verify', [SparePartShipmentController::class, 'verification']);
            Route::post('/spare-part-returns', [SparePartReturnController::class, 'store']);
        });

        // Koperasi Focus
        Route::middleware('role:koperasi')->group(function () {
            Route::post('/spare-parts/{spare_part}/update-price', [SparePartController::class, 'updatePrice']);
            Route::post('/spare-part-orders/{order}/keputusan', [SparePartOrderController::class, 'decision']);
            Route::patch('/spare-part-orders/{order}/estimate', [SparePartOrderController::class, 'estimate']);
            Route::post('/spare-part-shipments', [SparePartShipmentController::class, 'store']);
            Route::put('/spare-part-shipments/{shipment}', [SparePartShipmentController::class, 'update']);
            Route::post('/spare-part-shipments/{shipment}/submit', [SparePartShipmentController::class, 'submit']);
            Route::post('/spare-part-returns/{return}/replacement-shipment', [SparePartReturnController::class, 'createReplacement']);
            Route::patch('/spare-part-returns/{return}/reject', [SparePartReturnController::class, 'reject']);

            Route::get('/spare-part-price-logs', [SparePartPriceLogController::class, 'index']);
        });

        // Shared Action Routes (Evidences can be uploaded by Koperasi for initial/replacements, and FO for damage)
        Route::middleware('role:front_office,koperasi')->group(function () {
            Route::post('/spare-part-shipments/{shipment}/evidences', [SparePartShipmentController::class, 'uploadEvidence']);
            Route::post('/spare-part-shipments/batch-evidences', [SparePartShipmentController::class, 'uploadBatchEvidences']);
        });

        // Shared Transaction & Order Reads (FO & UPJ mostly)
        Route::middleware('role:front_office,kepala_upj,koperasi')->group(function () {
            Route::get('/transactions', [TransactionController::class, 'index']);
            Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
            Route::get('/transactions/{transaction}/print', [TransactionController::class, 'print']);

            Route::get('/spare-part-orders', [SparePartOrderController::class, 'index']);
            Route::get('/spare-part-orders/{order}', [SparePartOrderController::class, 'show']);

            Route::get('/spare-part-shipments', [SparePartShipmentController::class, 'index']);
            Route::get('/spare-part-shipments/{shipment}', [SparePartShipmentController::class, 'show']);

            Route::get('/spare-part-returns', [SparePartReturnController::class, 'index']);
            Route::get('/spare-part-returns/{return}', [SparePartReturnController::class, 'show']);

            Route::get('/shipment-evidences/{evidence}/download', [SparePartShipmentController::class, 'downloadEvidence']);
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
