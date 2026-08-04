<?php
require __DIR__.'/vendor/autoload.php';
\ = require_once __DIR__.'/bootstrap/app.php';
\->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
\ = new Illuminate\Http\Request();
\ = new App\Http\Controllers\Api\V1\SparePartShipmentController();
try {
    echo json_encode(\->index(\)->getData());
} catch (\Exception \) {
    echo " ERROR:n;
