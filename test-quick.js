const { spawn } = require('child_process')

console.log('🧪 Teste Rápido do Electron')
console.log('Executando debug version...')

// Executar versão de debug
const electron = spawn('npx', ['electron', 'electron/main-debug.js'], {
  stdio: 'inherit',
  shell: true
})

electron.on('close', (code) => {
  console.log(`\n👋 Electron finalizado com código: ${code}`)
})

electron.on('error', (err) => {
  console.error('❌ Erro ao iniciar Electron:', err)
})