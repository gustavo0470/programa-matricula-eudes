const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 Building Electron app with embedded server...')

// Set environment for production build
process.env.NODE_ENV = 'production'

// Build Next.js app (keeping server mode for APIs)
console.log('📦 Building Next.js app...')
const nextBuild = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
})

nextBuild.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Next.js build failed')
    process.exit(1)
  }

  console.log('✅ Next.js build completed')

  // Check if .next directory exists
  const nextDir = path.join(__dirname, '..', '.next')
  if (!fs.existsSync(nextDir)) {
    console.error('❌ Next.js build directory not found.')
    process.exit(1)
  }

  console.log('✅ Server files ready')

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
