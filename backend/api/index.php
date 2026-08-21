<?php

// Forward Vercel Serverless requests to normal public/index.php
// Set up writable storage directories in /tmp for Vercel serverless environment
$tmpStorage = '/tmp/storage';

if (!file_exists($tmpStorage . '/framework/views')) {
    @mkdir($tmpStorage . '/framework/views', 0777, true);
    @mkdir($tmpStorage . '/framework/cache/data', 0777, true);
    @mkdir($tmpStorage . '/framework/sessions', 0777, true);
    @mkdir($tmpStorage . '/logs', 0777, true);
    @mkdir($tmpStorage . '/app/public', 0777, true);
}

require __DIR__ . '/../public/index.php';
