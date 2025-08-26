const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🧪 Testando aplicação Electron...')

// 1. Verificar se o build existe
const outPath = path.join(__dirname, '..', 'out')
if (!fs.existsSync(outPath)) {
  console.error('❌ Diretório out/ não encontrado. Execute o build primeiro.')
  console.log('💡 Execute: npm run export')
  process.exit(1)
}

// 2. Verificar se index.html existe
const indexPath = path.join(outPath, 'index.html')
if (!fs.existsSync(indexPath)) {
  console.error('❌ Arquivo index.html não encontrado em out/')
  process.exit(1)
}

console.log('✅ Build encontrado em:', outPath)
console.log('✅ index.html encontrado')

// 3. Executar Electron em modo de desenvolvimento
console.log('🚀 Iniciando Electron...')
const electron = spawn('npx', ['electron', '.'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
})

electron.on('close', (code) => {
  console.log(`Electron finalizado com código: ${code}`)
})

electron.on('error', (err) => {
  console.error('❌ Erro ao iniciar Electron:', err)
})