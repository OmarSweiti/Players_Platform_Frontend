import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // A link to a route that does not exist fails the type-check (0.9.1).
  typedRoutes: true,
};

export default nextConfig;
