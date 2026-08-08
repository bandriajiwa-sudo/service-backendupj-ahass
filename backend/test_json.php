<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$log = \App\Models\SparePartPriceLog::with(['shipment.sparePartOrderDetail.sparePart'])->first();
echo json_encode($log->toArray(), JSON_PRETTY_PRINT);
