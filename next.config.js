/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly configure to use only the App Router
  experimental: {
    appDir: true,     // Enable the App Router
    serverActions: {
      bodySizeLimit: '10mb'
    },
    // Add optimizeCss for better CSS optimization
    optimizeCss: true,
    // Enable incremental static regeneration for better caching
    isrMemoryCacheSize: 50,
    // Optimize page loading
    scrollRestoration: true,
  },
  // Disable the Pages Router
  pageExtensions: [], // This effectively disables the Pages Router by not recognizing any page extensions
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pointme-storage.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Improve compilation speed and performance
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize output bundle
  poweredByHeader: false,
  // Optimize server responses
  compress: true,
  // Optimize production builds with React production features
  productionBrowserSourceMaps: false,
  // Server-specific optimizations
  onDemandEntries: {
    // Keep unused pages in memory for longer in development
    maxInactiveAge: 60 * 60 * 1000,
    // Cache more pages in memory
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig