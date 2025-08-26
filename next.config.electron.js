/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for static export
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Images optimization configuration
  images: {
    unoptimized: true
  },

  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true
  },

  // Environment variables for Electron
  env: {
    ELECTRON: 'true'
  },

  // Disable API routes in static export mode
  generateBuildId: () => 'build',
  distDir: 'out',
  
  // Note: exportPathMap not supported in App Router (Next.js 13+)
  // API routes are automatically excluded in static export
}

module.exports = nextConfig
