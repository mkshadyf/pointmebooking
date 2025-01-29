const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [
    /middleware-manifest.json$/,
    /_middleware.js$/,
    /_buildManifest.js$/
  ],
  dynamicStartUrl: false,
  cacheStartUrl: false,
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif|gif|ico)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'image-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      '@headlessui/react',
      '@heroicons/react',
      'date-fns',
      'react-hot-toast'
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      worker_threads: false
    };
    return config;
  }
};

module.exports = withPWA(nextConfig);