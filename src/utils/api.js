/**
 * API configuration helper.
 * Selects localhost URL when running locally, and maps to vercel routePrefix for production.
 */
export const getApiUrl = (path) => {
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const base = isLocal ? 'http://localhost:8000' : '/_/backend';
  return `${base}${path}`;
};
