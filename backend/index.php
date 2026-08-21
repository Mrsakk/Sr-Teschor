<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Set up writable storage directory in /tmp for Vercel Serverless
$tmpStorage = '/tmp/storage';
if (!file_exists($tmpStorage . '/framework/views')) {
    @mkdir($tmpStorage . '/framework/views', 0777, true);
    @mkdir($tmpStorage . '/framework/cache/data', 0777, true);
    @mkdir($tmpStorage . '/framework/sessions', 0777, true);
    @mkdir($tmpStorage . '/logs', 0777, true);
    @mkdir($tmpStorage . '/app/public', 0777, true);
}

// Register the Composer autoloader...
require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
