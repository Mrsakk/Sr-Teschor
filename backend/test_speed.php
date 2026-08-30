<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$endpoints = [
    '/api/destinations' => 'Destinations List',
    '/api/businesses' => 'Businesses List',
    '/api/categories' => 'Categories List',
    '/api/promotions' => 'Promotions List',
    '/api/advertisements' => 'Advertisements List',
    '/api/destinations/kampong-phluk' => 'Destination Detail',
    '/api/businesses/sister-srey-cafe' => 'Business Detail',
    '/api/search?q=Angkor' => 'Global Search API',
    '/api/travel-packages' => 'Travel Packages',
];

echo "========================================================================================\n";
echo "           🚀 SR TESCHOR API DATA FETCHING PERFORMANCE TEST (< 1.00s Target)\n";
echo "========================================================================================\n";
printf("%-35s | %-8s | %-12s | %-12s | %-15s\n", "Endpoint Name", "HTTP", "Response Time", "Data Size", "Target (<1s)");
echo str_repeat("-", 88) . "\n";

$times = [];

foreach ($endpoints as $ep => $name) {
    $request = Illuminate\Http\Request::create($ep, 'GET');
    $request->headers->set('Accept', 'application/json');

    $start = microtime(true);
    $response = $kernel->handle($request);
    $durationMs = round((microtime(true) - $start) * 1000, 2);

    $times[] = $durationMs;
    $httpCode = $response->getStatusCode();
    $content = $response->getContent();
    $sizeFormatted = round(strlen($content) / 1024, 2) . " KB";
    $passed = ($durationMs < 1000) ? "✅ PASS (<1s)" : "⚠️ SLOW (>1s)";

    printf("%-35s | %-8s | %-12s | %-12s | %-15s\n", $ep, $httpCode, $durationMs . " ms", $sizeFormatted, $passed);
    $kernel->terminate($request, $response);
}

echo str_repeat("-", 88) . "\n";
$avg = round(array_sum($times) / count($times), 2);
$max = max($times);
$min = min($times);

echo "📊 លទ្ធផលធ្វើតេស្តសរុប (SUMMARY REPORT):\n";
echo "   ⚡ ល្បឿនលឿនបំផុត (Fastest)  : {$min} ms (" . round($min / 1000, 3) . "s)\n";
echo "   ⚡ ល្បឿនមធ្យម (Average)     : {$avg} ms (" . round($avg / 1000, 3) . "s)\n";
echo "   ⚡ ល្បឿនយូរបំផុត (Slowest)  : {$max} ms (" . round($max / 1000, 3) . "s)\n";
echo "   🎯 ការវាយតម្លៃរួម (Status)  : " . ($avg < 1000 ? "✅ ឆ្លងផុតបទដ្ឋាន < 1 វិនាទី យ៉ាងត្រចះត្រចង់!" : "⚠️ ត្រូវការ Optimize បន្ថែម") . "\n";
echo "========================================================================================\n";
