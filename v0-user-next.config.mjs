/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placeholder.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  // Configuración para permitir solicitudes a dominios externos
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://www.autoseguro.gob.cl/:path*',
      },
    ];
  },
};

export default nextConfig;

