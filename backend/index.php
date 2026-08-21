<?php

ini_set('display_errors', '1');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    define('LARAVEL_START', microtime(true));

    // Check if vendor autoloader exists
    if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
        throw new Exception("Composer vendor/autoload.php not found in " . __DIR__);
    }

    require __DIR__ . '/vendor/autoload.php';

    /** @var \Illuminate\Foundation\Application $app */
    $app = require_once __DIR__ . '/bootstrap/app.php';

    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    $response = $kernel->handle(
        $request = \Illuminate\Http\Request::capture()
    );

    $response->send();
    $kernel->terminate($request, $response);

} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'php_version' => PHP_VERSION,
        'loaded_extensions' => get_loaded_extensions(),
    ], JSON_PRETTY_PRINT);
    exit;
}
