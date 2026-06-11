/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      // Frontend calls stay on :3000; Next proxies to internal services.
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/model/:path*',
        destination: 'http://localhost:8000/:path*',
      },
      {
        source: '/predict/:path*',
        destination: 'http://localhost:8000/predict/:path*',
      },
    ];
  },
  images: {
    domains: ['localhost', 'api.finvision.ai'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
