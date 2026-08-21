<?php
$url = 'https://maps.app.goo.gl/6trBb7ss47GaWhVJA';
$headers = get_headers($url, 1);
$location = isset($headers['Location']) ? $headers['Location'] : (isset($headers['location']) ? $headers['location'] : '');
$finalUrl = is_array($location) ? end($location) : $location;
echo "Final URL: " . $finalUrl . "\n";
if (preg_match('/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $finalUrl, $matches)) {
    echo "PIN: " . $matches[1] . ", " . $matches[2] . "\n";
}
if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
    echo "VIEW: " . $matches[1] . ", " . $matches[2] . "\n";
}
