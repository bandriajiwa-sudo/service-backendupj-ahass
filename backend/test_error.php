<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $lockedShipment = App\Models\SparePartShipment::find(3);
    if (!$lockedShipment) {
        $lockedShipment = new App\Models\SparePartShipment([
            'spare_part_order_id' => 1,
            'shipment_type' => 'replacement',
            'quantity' => 5,
        ]);
        $lockedShipment->sparePartOrder = new App\Models\SparePartOrder(['spare_part_id' => 1]);
    }

    // Simulate line 247-255
    App\Models\SparePartReturn::where('spare_part_order_id', $lockedShipment->spare_part_order_id)
        ->where('status', 'dikirim_ulang')
        ->update([
            'status' => 'selesai',
            'resolved_by' => 1,
            'resolved_at' => now(),
        ]);

    echo "Block 1 OK\n";

    // Simulate line 258
    $stock = App\Models\SparePartStock::where('spare_part_id', $lockedShipment->sparePartOrder->spare_part_id)
        ->first();

    if ($stock) {
        $stock->stok_sekarang += $lockedShipment->quantity;
        $stock->terakhir_diperbarui = now();
        // $stock->save();
    }

    echo "Block 2 OK\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
