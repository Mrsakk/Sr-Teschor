<?php

namespace App\Support;

use App\Models\StoredFile;
use Illuminate\Support\Str;

class DbStorage
{
    /**
     * Persist raw binary content in the database and return its public URL.
     * The local disk is ephemeral on serverless (Vercel), so uploads must
     * live in the database to survive across requests.
     */
    public static function put(string $binary, string $dir, string $prefix, string $ext = 'jpg', string $mime = 'image/jpeg'): string
    {
        $fileName = $prefix . '_' . Str::random(16) . '.' . $ext;
        $path = trim($dir, '/') . '/' . $fileName;

        StoredFile::create([
            'path' => $path,
            'mime' => $mime,
            'data' => base64_encode($binary),
        ]);

        return url('/api/storage/' . $path);
    }

    /**
     * Decode a base64 data URL (data:image/xxx;base64,...) and store it.
     * Returns the public URL, or null when the input is not a data URL.
     */
    public static function putDataUrl(?string $dataUrl, string $dir, string $prefix): ?string
    {
        if (!$dataUrl || !is_string($dataUrl) || !preg_match('/^data:image\/([\w+.-]+);base64,/', $dataUrl, $type)) {
            return null;
        }

        $imageBytes = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $decoded = base64_decode($imageBytes);

        if ($decoded === false) {
            return null;
        }

        $ext = self::normalizeExt(strtolower($type[1]));

        return self::put($decoded, $dir, $prefix, $ext, 'image/' . ($ext === 'jpg' ? 'jpeg' : $ext));
    }

    /**
     * Store an uploaded Symfony file instance. Returns the public URL.
     */
    public static function putUploadedFile($file, string $dir, string $prefix): string
    {
        return self::put(
            file_get_contents($file->getRealPath()),
            $dir,
            $prefix,
            strtolower($file->getClientOriginalExtension() ?: 'jpg'),
            $file->getMimeType() ?: 'image/jpeg'
        );
    }

    private static function normalizeExt(string $ext): string
    {
        return match (true) {
            in_array($ext, ['jpg', 'jpeg']) => 'jpg',
            in_array($ext, ['gif', 'png', 'webp']) => $ext,
            str_contains($ext, 'svg') => 'svg',
            default => 'jpg',
        };
    }
}
