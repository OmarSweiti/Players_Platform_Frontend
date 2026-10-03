import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // A link to a route that does not exist fails the type-check (0.9.1).
  typedRoutes: true,
};

// Loads the catalogs for the request's locale (src/i18n/request.ts, 0.9.2).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
