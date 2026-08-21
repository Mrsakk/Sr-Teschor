<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$url = 'https://maps.app.goo.gl/6trBb7ss47GaWhVJA';
$response = \Illuminate\Support\Facades\Http::withOptions([
    'allow_redirects' => [
        'max'             => 5,
        'strict'          => true,
        'referer'         => true,
        'protocols'       => ['http', 'https'],
        'track_redirects' => true
    ]
])->get($url);

$finalUrl = $response->handlerStats()['url'] ?? $url;
echo "Final URL: " . $finalUrl . "\n";
