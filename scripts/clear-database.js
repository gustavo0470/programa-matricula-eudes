// Script para limpar o banco de dados
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('🗑️  Iniciando limpeza do banco de dados...')
    
    // Deletar dados em ordem (respeitando foreign keys)
    console.log('📄 Removendo uploads de documentos...')
    await prisma.documentUpload.deleteMany()
    
    console.log('📚 Removendo matrículas...')
    await prisma.enrollment.deleteMany()
    
    console.log('👥 Removendo estudantes...')
    await prisma.student.deleteMany()
    
    console.log('🎓 Removendo cursos...')
    await prisma.course.deleteMany()
    
    console.log('✅ Banco de dados limpo com sucesso!')
    console.log('📊 Todas as tabelas foram esvaziadas.')
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Confirmação de segurança
console.log('⚠️  ATENÇÃO: Este script irá DELETAR TODOS OS DADOS do banco!')
console.log('📋 Dados que serão removidos:')
console.log('   - Todos os estudantes')
console.log('   - Todos os cursos')
console.log('   - Todas as matrículas')
console.log('   - Todos os uploads de documentos')
console.log('')

if (process.argv.includes('--confirm')) {
  clearDatabase()
} else {
  console.log('🔒 Para executar a limpeza, use:')
  console.log('   npm run db:clear -- --confirm')
  console.log('')
  console.log('💡 Ou execute diretamente:')
  console.log('   node scripts/clear-database.js --confirm')
}
