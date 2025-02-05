/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // experimental: {
  //   optimizeCss: true,
  //  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
};

module.exports = nextConfig;