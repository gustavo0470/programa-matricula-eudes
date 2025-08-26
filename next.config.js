/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Don't use static export because of API routes
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Images optimization configuration
  images: {
    unoptimized: true
  },

  // Disable ESLint during builds if needed
  eslint: {
    ignoreDuringBuilds: true
  },

  // Environment variables for Electron
  env: {
    ELECTRON: process.env.ELECTRON || 'false'
  },

  // Webpack optimizations (simplified to avoid SSR issues)
  webpack: (config, { isServer }) => {
    // Exclude service worker from server bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(/^sw\.js$/);
    }
    return config;
  },

  // Configuração condicional para Electron (sem static export)
  ...(process.env.BUILD_ELECTRON === 'true' && {
    generateBuildId: () => 'build'
  }),

  // Experimental features (disabled due to missing critters dependency)
  // experimental: {
  //   optimizeCss: true
  // }
}

module.exports = nextConfig