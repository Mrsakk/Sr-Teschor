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

  // Detect dev vs production environment
  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const devHost = `http://${window.location.hostname || 'localhost'}:8000`;
  const liveStorage = isDev
    ? `${devHost}/api/storage`
    : 'https://sr-teschor-api.vercel.app/api/storage';
  const liveBase = isDev
    ? devHost
    : 'https://sr-teschor-api.vercel.app';

  let resolved = url
    // Normalise any existing absolute URLs to the correct base
    .replace(/https?:\/\/sr-teschor-api\.vercel\.app\/api\/storage/g, liveStorage)
    .replace(/https?:\/\/sr-teschor-api\.vercel\.app\/storage/g, liveStorage)
    .replace(/https?:\/\/sr-teschor-api\.vercel\.app/g, liveBase)
    .replace(/https?:\/\/localhost:8000\/api\/storage/g, liveStorage)
    .replace(/https?:\/\/localhost:8000\/storage/g, liveStorage)
    .replace(/https?:\/\/127\.0\.0\.1:8000\/api\/storage/g, liveStorage)
    .replace(/https?:\/\/127\.0\.0\.1:8000\/storage/g, liveStorage)
    .replace(/https?:\/\/localhost:8000/g, liveBase)
    .replace(/https?:\/\/127\.0\.0\.1:8000/g, liveBase);

  if (resolved.startsWith('/api/storage/')) {
    resolved = `${liveBase}${resolved}`;
  } else if (resolved.startsWith('/storage/')) {
    resolved = `${liveStorage}${resolved.replace('/storage', '')}`;
  } else if (resolved.startsWith('uploads/') || resolved.startsWith('businesses/')) {
    resolved = `${liveStorage}/${resolved}`;
  }

  return resolved;
}
