const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 PWA Debug Test')
console.log('================')

// 1. Verificar arquivos PWA
console.log('📱 1. Verificando arquivos PWA...')
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/offline.html',
  'public/logo.png'
]

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - FALTANDO`)
  }
})

// 2. Verificar conteúdo do manifest
console.log('\n📋 2. Verificando manifest.json...')
try {
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  
  console.log(`✅ Nome: ${manifest.name}`)
  console.log(`✅ Display: ${manifest.display}`)
  console.log(`✅ Start URL: ${manifest.start_url}`)
  console.log(`✅ Ícones: ${manifest.icons?.length || 0}`)
  
  if (!manifest.icons || manifest.icons.length === 0) {
    console.log('⚠️ AVISO: Nenhum ícone configurado!')
  }
  
} catch (error) {
  console.log('❌ Erro ao ler manifest:', error.message)
}

// 3. Verificar Service Worker
console.log('\n🔧 3. Verificando Service Worker...')
const swPath = path.join(__dirname, '..', 'public', 'sw.js')
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8')
  console.log(`✅ Service Worker existe (${swContent.length} bytes)`)
  
  if (swContent.includes('install')) {
    console.log('✅ Event listener "install" encontrado')
  }
  if (swContent.includes('activate')) {
    console.log('✅ Event listener "activate" encontrado')
  }
  if (swContent.includes('fetch')) {
    console.log('✅ Event listener "fetch" encontrado')
  }
} else {
  console.log('❌ Service Worker não encontrado')
}

console.log('\n🚀 4. Iniciando servidor de desenvolvimento...')
console.log('📖 Instruções para testar PWA:')
console.log('   1. Aguarde o servidor iniciar')
console.log('   2. Abra Chrome/Edge: http://localhost:3007')
console.log('   3. Pressione F12 > Application tab')
console.log('   4. Verifique:')
console.log('      - Manifest (lado esquerdo)')
console.log('      - Service Workers')
console.log('      - Installability (pode mostrar erros)')
console.log('   5. Para instalar: ícone + na barra de endereço')
console.log('   6. Ou: Chrome menu > Install Sistema de Matrícula')
console.log('')

// 5. Iniciar servidor
const server = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
})

server.on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err)
})

// Aguardar alguns segundos e dar dicas
setTimeout(() => {
  console.log('\n💡 Dicas de troubleshooting:')
  console.log('   - Se não aparecer o ícone +, verifique console (F12)')
  console.log('   - Manifest deve estar válido')
  console.log('   - Service Worker deve registrar sem erros')
  console.log('   - Precisa de HTTPS em produção (localhost funciona)')
  console.log('   - Alguns browsers só mostram install após algumas visitas')
}, 5000)

process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...')
  server.kill()
  process.exit(0)
})