<?php

$baseUrl = 'http://127.0.0.1:8000';
$endpoints = [
    '/api/destinations' => 'Destinations List',
    '/api/businesses' => 'Businesses List',
    '/api/categories' => 'Categories List',
    '/api/promotions' => 'Promotions List',
    '/api/advertisements' => 'Advertisements List',
    '/api/destinations/kampong-phluk' => 'Destination Detail (Kampong Phluk)',
    '/api/businesses/sister-srey-cafe' => 'Business Detail (Sister Srey)',
    '/api/search?q=Angkor' => 'Global Search API (Angkor)',
    '/api/travel-packages' => 'Travel Packages',
];

echo "========================================================================================\n";
echo "           🚀 SR TESCHOR API DATA FETCHING PERFORMANCE TEST (< 1.00s Target)\n";
echo "========================================================================================\n";
printf("%-35s | %-8s | %-12s | %-12s | %-15s\n", "Endpoint Name", "HTTP", "Latency", "Data Size", "Target (<1s)");
echo str_repeat("-", 88) . "\n";

$times = [];

foreach ($endpoints as $ep => $name) {
    $url = $baseUrl . $ep;
    $start = microtime(true);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $size = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
    curl_close($ch);

    $durationMs = round((microtime(true) - $start) * 1000, 2);
    $times[] = $durationMs;

    $passed = ($durationMs < 1000) ? "✅ PASS (<1s)" : "⚠️ SLOW (>1s)";
    $sizeFormatted = round($size / 1024, 2) . " KB";

    printf("%-35s | %-8s | %-12s | %-12s | %-15s\n", $ep, $httpCode, $durationMs . " ms", $sizeFormatted, $passed);
}

echo str_repeat("-", 88) . "\n";
$avg = round(array_sum($times) / count($times), 2);
$max = max($times);
$min = min($times);

echo "📊 SUMMARY:\n";
echo "   - Fastest API Response : {$min} ms\n";
echo "   - Average API Response : {$avg} ms\n";
echo "   - Slowest API Response : {$max} ms\n";
echo "   - Overall Rating       : " . ($avg < 1000 ? "⚡ EXTREMELY FAST (Well within 1s limit!)" : "⚠️ Needs further optimization") . "\n";
echo "========================================================================================\n";
