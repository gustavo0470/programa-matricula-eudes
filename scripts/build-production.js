const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Iniciando build para produção...')

// 1. Verificar se o arquivo .env.production existe
const envProdPath = path.join(__dirname, '..', '.env.production')
if (!fs.existsSync(envProdPath)) {
  console.error('❌ Arquivo .env.production não encontrado!')
  console.log('📝 Crie o arquivo .env.production com suas configurações do Supabase')
  process.exit(1)
}

// 2. Verificar dependências necessárias
try {
  console.log('📦 Verificando dependências...')
  execSync('npm list concurrently wait-on', { stdio: 'ignore' })
} catch (error) {
  console.log('📦 Instalando dependências necessárias...')
  execSync('npm install --save-dev concurrently wait-on', { stdio: 'inherit' })
}

// 3. Limpar builds anteriores
console.log('🧹 Limpando builds anteriores...')
try {
  execSync('rmdir /s /q dist', { stdio: 'ignore' })
} catch (error) {
  // Ignorar erro se o diretório não existir
}

try {
  execSync('rmdir /s /q .next', { stdio: 'ignore' })
} catch (error) {
  // Ignorar erro se o diretório não existir
}

// 4. Copiar arquivo de produção
console.log('⚙️ Configurando ambiente de produção...')
const envLocalPath = path.join(__dirname, '..', '.env.local')
const envProdContent = fs.readFileSync(envProdPath, 'utf8')
fs.writeFileSync(envLocalPath, envProdContent)

// 5. Build do Next.js (mantendo APIs)
console.log('🏗️ Fazendo build do Next.js...')
try {
  execSync('npm run build', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Erro no build do Next.js:', error.message)
  process.exit(1)
}

// 6. Build do Electron
console.log('📦 Criando executável do Electron...')
try {
  execSync('npx electron-builder --win', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Erro no build do Electron:', error.message)
  process.exit(1)
}

console.log('✅ Build concluído com sucesso!')
console.log('📁 Arquivos gerados em: ./dist/')
console.log('💡 Para testar: execute o arquivo .exe em ./dist/')

// 7. Restaurar .env.local original (opcional)
console.log('🔄 Restaurando configurações de desenvolvimento...')
try {
  const envExamplePath = path.join(__dirname, '..', '.env.local.example')
  if (fs.existsSync(envExamplePath)) {
    // Se não existe .env.local original, remove o temporário
    fs.unlinkSync(envLocalPath)
    console.log('📝 Lembre-se de reconfigurar seu .env.local para desenvolvimento')
  }
} catch (error) {
  console.log('⚠️ Mantenha seu .env.local configurado para desenvolvimento')
}