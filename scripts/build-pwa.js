const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Build PWA - Sistema de Matrícula')
console.log('=====================================')

// 1. Verificar configuração
console.log('📋 1. Verificando configuração...')

const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/offline.html'
]

let missingFiles = []
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file)
  }
})

if (missingFiles.length > 0) {
  console.error('❌ Arquivos PWA faltando:', missingFiles.join(', '))
  process.exit(1)
}
console.log('✅ Arquivos PWA encontrados')

// 2. Verificar ícones
console.log('📱 2. Verificando ícones...')
const requiredIcons = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512']
let missingIcons = []

requiredIcons.forEach(size => {
  const iconPath = path.join(__dirname, '..', 'public', `icon-${size}.png`)
  if (!fs.existsSync(iconPath)) {
    missingIcons.push(`icon-${size}.png`)
  }
})

if (missingIcons.length > 0) {
  console.log('⚠️ Ícones faltando:', missingIcons.join(', '))
  console.log('💡 Execute: node scripts/generate-pwa-icons.js')
  console.log('📖 Veja instruções em: ICONES-PWA.md')
  
  // Criar ícones básicos se não existirem
  console.log('🔄 Criando ícones placeholder...')
  execSync('node scripts/generate-pwa-icons.js', { stdio: 'inherit' })
} else {
  console.log('✅ Todos os ícones encontrados')
}

// 3. Limpar builds anteriores
console.log('🧹 3. Limpando builds anteriores...')
try {
  if (fs.existsSync(path.join(__dirname, '..', '.next'))) {
    execSync('rmdir /s /q .next', { stdio: 'ignore' })
  }
  if (fs.existsSync(path.join(__dirname, '..', 'out'))) {
    execSync('rmdir /s /q out', { stdio: 'ignore' })
  }
} catch (error) {
  // Ignorar erros de limpeza
}
console.log('✅ Limpeza concluída')

// 4. Build do Next.js
console.log('🏗️ 4. Fazendo build do Next.js...')
try {
  execSync('npm run build', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Erro no build:', error.message)
  process.exit(1)
}
console.log('✅ Build concluído')

// 5. Verificar build
console.log('🔍 5. Verificando build...')
const buildDir = path.join(__dirname, '..', '.next')
if (!fs.existsSync(buildDir)) {
  console.error('❌ Diretório .next não encontrado')
  process.exit(1)
}
console.log('✅ Build verificado')

// 6. Instruções de deploy
console.log('📦 6. Build PWA concluído!')
console.log('')
console.log('🌐 Para testar localmente:')
console.log('   npm start')
console.log('   Abra: http://localhost:3007')
console.log('')
console.log('📱 Para testar PWA:')
console.log('   1. Abra no Chrome/Edge')
console.log('   2. Pressione F12 > Application > Manifest')
console.log('   3. Clique em "Install" no endereço')
console.log('')
console.log('🚀 Para deploy:')
console.log('   - Vercel: npx vercel')
console.log('   - Netlify: netlify deploy --prod')
console.log('   - Servidor próprio: copie .next + public')
console.log('')

// 7. Criar arquivo de informações
const buildInfo = {
  timestamp: new Date().toISOString(),
  version: require('../package.json').version,
  type: 'PWA',
  nextjs: true,
  pwa: true,
  offline: true,
  files: {
    manifest: fs.existsSync(path.join(__dirname, '..', 'public/manifest.json')),
    serviceWorker: fs.existsSync(path.join(__dirname, '..', 'public/sw.js')),
    offlinePage: fs.existsSync(path.join(__dirname, '..', 'public/offline.html'))
  },
  icons: requiredIcons.reduce((acc, size) => {
    acc[`icon-${size}`] = fs.existsSync(path.join(__dirname, '..', `public/icon-${size}.png`))
    return acc
  }, {})
}

fs.writeFileSync(
  path.join(__dirname, '..', 'build-info.json'), 
  JSON.stringify(buildInfo, null, 2)
)

console.log('✅ Build info salvo em build-info.json')
console.log('🎉 PWA pronto para uso!')