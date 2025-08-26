const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 Building Electron app...')

// Set environment for production build
process.env.NODE_ENV = 'production'
process.env.BUILD_ELECTRON = 'true'

// Backup original next.config.js and use Electron-specific config
const originalConfig = path.join(__dirname, '..', 'next.config.js')
const electronConfig = path.join(__dirname, '..', 'next.config.electron.js')
const backupConfig = path.join(__dirname, '..', 'next.config.backup.js')

console.log('📋 Setting up Electron-specific Next.js configuration...')

// Backup original config
if (fs.existsSync(originalConfig)) {
  fs.copyFileSync(originalConfig, backupConfig)
}

// Copy Electron config as main config
fs.copyFileSync(electronConfig, originalConfig)

// Build Next.js app for static export
console.log('📦 Building Next.js app for static export...')
const nextBuild = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
})

nextBuild.on('close', (code) => {
  // Restore original config
  if (fs.existsSync(backupConfig)) {
    fs.copyFileSync(backupConfig, originalConfig)
    fs.unlinkSync(backupConfig)
  }

  if (code !== 0) {
    console.error('❌ Next.js build failed')
    process.exit(1)
  }

  console.log('✅ Next.js build completed')

  // Check if out directory exists
  const outDir = path.join(__dirname, '..', 'out')
  if (!fs.existsSync(outDir)) {
    console.error('❌ Static export directory not found. Build may have failed.')
    process.exit(1)
  }

  console.log('✅ Static files ready')

  // Build Electron app
  console.log('⚡ Building Electron distributable...')
  const electronBuild = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'electron:dist'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  })

  electronBuild.on('close', (electronCode) => {
    if (electronCode !== 0) {
      console.error('❌ Electron build failed')
      process.exit(1)
    }

    console.log('🎉 Electron app built successfully!')
    console.log('📁 Distribution files are in the dist/ folder')
    console.log('💡 The installer should now work correctly after installation')
  })
})