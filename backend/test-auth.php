<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/v1/authorizer/login', 'POST', [
    'username' => 'admin_dev',
    'password' => 'password_dev_123',
], [], [], [
    'HTTP_ACCEPT' => 'application/json',
]);

$response = $kernel->handle($request);
echo "\n--- RESPONSE ---\n";
echo "STATUS: " . $response->getStatusCode() . "\n";
echo "BODY: " . $response->getContent() . "\n";
