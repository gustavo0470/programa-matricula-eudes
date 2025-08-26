/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential configurations for Vercel deployment
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // Images optimization
  images: {
    unoptimized: true
  },

  // Webpack optimizations (simplified to avoid SSR issues)
  webpack: (config, { isServer }) => {
    // Exclude service worker from server bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(/^sw\.js$/);
    }
    return config;
  }
}

module.exports = nextConfig