/**
 * Resolves any image URL ensuring it loads seamlessly across local development (localhost)
 * and production (live storage / CDN).
 */
export function getFullImageUrl(url, fallback = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80') {
  if (!url) return fallback;
  if (typeof url !== 'string') return fallback;

  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // 1. Data URLs (base64 image uploads) - render directly
  if (trimmed.startsWith('data:image/')) return trimmed;

  // 2. Detect local vs production environment
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocal) {
    const localBase = 'http://localhost:8000';
    if (trimmed.startsWith('http://localhost:8000') || trimmed.startsWith('http://127.0.0.1:8000')) {
      return trimmed;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/storage/')) return `${localBase}${trimmed}`;
    if (trimmed.startsWith('storage/')) return `${localBase}/${trimmed}`;
    if (trimmed.startsWith('/api/storage/')) return `${localBase}${trimmed}`;
    if (trimmed.startsWith('uploads/') || trimmed.startsWith('businesses/')) {
      return `${localBase}/storage/${trimmed}`;
    }
    return `${localBase}/storage/${trimmed.replace(/^\/+/, '')}`;
  }

  // 3. Production environment resolution
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('localhost:8000') || trimmed.includes('127.0.0.1:8000')) {
      const liveStorage = import.meta.env.VITE_STORAGE_URL || 'https://sr-teschor-api.vercel.app/api/storage';
      const cleanPath = trimmed.replace(/http:\/\/(localhost|127\.0\.0\.1):8000(\/api)?\/storage\/?/g, '');
      return `${liveStorage}/${cleanPath}`;
    }
    return trimmed;
  }

  const liveStorage = import.meta.env.VITE_STORAGE_URL || 'https://sr-teschor-api.vercel.app/api/storage';
  const cleanPath = trimmed.replace(/^\/?(api\/)?storage\/?/, '');
  return `${liveStorage}/${cleanPath}`;
}
