/**
 * Resolves any image URL ensuring it loads securely over HTTPS from the live backend
 * and replaces any local development URLs (localhost:8000) or missing storage prefixes.
 */
export function getFullImageUrl(url, fallback = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80') {
  if (!url) return fallback;
  if (typeof url !== 'string') return fallback;

  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) return trimmed;

  const liveStorage = 'https://sr-teschor-api.vercel.app/api/storage';

  let resolved = url
    .replace(/http:\/\/localhost:8000\/storage/g, liveStorage)
    .replace(/http:\/\/127\.0\.0\.1:8000\/storage/g, liveStorage)
    .replace(/http:\/\/localhost:8000/g, 'https://sr-teschor-api.vercel.app')
    .replace(/https:\/\/sr-teschor-api\.vercel\.app\/storage/g, liveStorage)
    .replace(/http:\/\/sr-teschor-api\.vercel\.app\/api\/storage/g, liveStorage)
    .replace(/http:\/\/sr-teschor-api\.vercel\.app\/storage/g, liveStorage);

  if (resolved.startsWith('/api/storage/')) {
    resolved = `https://sr-teschor-api.vercel.app${resolved}`;
  } else if (resolved.startsWith('/storage/')) {
    resolved = `${liveStorage}${resolved.replace('/storage', '')}`;
  } else if (resolved.startsWith('uploads/') || resolved.startsWith('businesses/')) {
    resolved = `${liveStorage}/${resolved}`;
  }

  return resolved;
}
