<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();

if (getenv('VERCEL') || isset($_SERVER['VERCEL']) || isset($_ENV['VERCEL'])) {
    $tmp = '/tmp/storage';
    if (!is_dir($tmp . '/framework/views')) {
        @mkdir($tmp . '/framework/views', 0777, true);
        @mkdir($tmp . '/framework/cache/data', 0777, true);
        @mkdir($tmp . '/framework/sessions', 0777, true);
        @mkdir($tmp . '/logs', 0777, true);
        @mkdir($tmp . '/app/public', 0777, true);
    }
    $app->useStoragePath($tmp);
}

return $app;
