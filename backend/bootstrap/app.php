<?php

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: '',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->api(prepend: [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                // Tangani Unauthenticated secara spesifik untuk memblokir fallback redirect Laravel
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthenticated.'
                    ], 401);
                }

                // Biarkan validasi, dan error HTTP (404/403) tertangani bawaan Laravel
                if (
                    $e instanceof \Illuminate\Validation\ValidationException ||
                    $e instanceof \Symfony\Component\HttpKernel\Exception\HttpException
                ) {
                    return null;
                }

                \Illuminate\Support\Facades\Log::error($e->getMessage(), ['trace' => $e->getTraceAsString()]);

                if (config('app.debug')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'DEBUG ERROR: ' . $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ], 500);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan sistem pada peladen saat memproses operasional data.',
                ], 500);
            }
        });
    })->create();

if (isset($_ENV['VERCEL']) || env('VERCEL')) {
    $app->useStoragePath('/tmp/storage');
}

return $app;
