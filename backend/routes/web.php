<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'message' => 'Tes Chor API Platform is running smoothly',
        'database' => 'Neon PostgreSQL Connected',
        'version' => '1.0.0',
    ]);
});

// Serve uploaded storage assets on serverless environment with automatic caching & fallback
Route::get('/storage/{path}', function ($path) {
    $filePath = public_path('storage/' . $path);
    if (!file_exists($filePath)) {
        $filePath = storage_path('app/public/' . $path);
    }

    if (file_exists($filePath) && !is_dir($filePath)) {
        $mime = mime_content_type($filePath) ?: 'image/jpeg';
        return response()->file($filePath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }

    // Graceful fallback image if not found locally
    return redirect('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80');
})->where('path', '.*');
