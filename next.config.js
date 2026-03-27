/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
  
  // API routes and static generation
  pageExtensions: ['ts', 'tsx'],
  
  // Image optimization
  images: {
    unoptimized: true, // Disable image optimization for static export
    domains: []
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  
  // Redirects (if needed)
  async redirects() {
    return [];
  },
  
  // Rewrites (for API routing)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: []
    };
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    return config;
  }
};

module.exports = nextConfig;
