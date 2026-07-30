<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $login = App\Models\Login::where('username', 'admin_dev')->first();
    if (!$login)
        throw new \Exception("User admin_dev not found");
    $token = $login->createToken('test');
    echo "SUCCESS: " . $token->plainTextToken . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
