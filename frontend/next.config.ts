import type { NextConfig } from 'next';

// O frontend NAO conhece o backend em build time.
// A descoberta acontece em runtime: a API Route em /app/api/[...path]/route.ts
// le process.env.BACKEND_URL a cada request e faz proxy pro backend real.
// Pra trocar de backend basta mudar a env BACKEND_URL no CAE - sem rebuild.

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
