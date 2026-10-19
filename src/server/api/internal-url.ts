import 'server-only';

/**
 * The API's address as this server reaches it: API_INTERNAL_URL, an origin
 * (`http://localhost:3000` in development, .env.example) — configuration,
 * never a value a browser chose. The contract's paths carry their own prefix
 * (`/api/v1/…`), so the address is the origin alone. Errors name the
 * variable, never its value.
 */
export function apiInternalUrl(): string {
  const raw = process.env.API_INTERNAL_URL;
  if (!raw) {
    throw new Error(
      'API_INTERNAL_URL is not set: the API address server renders call (see .env.example)',
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('API_INTERNAL_URL must be a URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('API_INTERNAL_URL must be an http or https URL');
  }
  if (url.pathname !== '/' || url.search !== '' || url.hash !== '') {
    throw new Error('API_INTERNAL_URL must be an origin, with no path');
  }
  return url.origin;
}
