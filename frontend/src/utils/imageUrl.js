/**
 * Resolves any image URL ensuring it loads securely over HTTPS from the live backend
 * and replaces any local development URLs (localhost:8000).
 */
export function getFullImageUrl(url, fallback = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80') {
  if (!url) return fallback;
  if (typeof url !== 'string') return fallback;

  const liveBackend = 'https://sr-teschor-api.vercel.app';

  // Replace any hardcoded localhost:8000 or 127.0.0.1:8000
  let resolved = url
    .replace(/http:\/\/localhost:8000/g, liveBackend)
    .replace(/http:\/\/127\.0\.0\.1:8000/g, liveBackend);

  // If it's a relative path starting with /storage
  if (resolved.startsWith('/storage/')) {
    resolved = `${liveBackend}${resolved}`;
  } else if (resolved.startsWith('uploads/') || resolved.startsWith('businesses/')) {
    resolved = `${liveBackend}/storage/${resolved}`;
  }

  return resolved;
}
