const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function testSystem() {
  console.log('🔍 Testando sistema completo...\n');
  
  // Test 1: Database connection
  console.log('1️⃣ Testando conexão com banco de dados...');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados: OK');
    
    // Count records
    const studentCount = await prisma.student.count();
    const courseCount = await prisma.course.count();
    const enrollmentCount = await prisma.enrollment.count();
    
    console.log(`   📊 Alunos: ${studentCount}`);
    console.log(`   📊 Cursos: ${courseCount}`);
    console.log(`   📊 Matrículas: ${enrollmentCount}`);
    
  } catch (error) {
    console.log('❌ Erro na conexão com banco:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  // Test 2: Supabase configuration
  console.log('\n2️⃣ Testando configuração do Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL não configurada');
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL configurada');
  }
  
  if (!supabaseAnonKey) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configurada');
  }
  
  if (!supabaseServiceKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY configurada');
  }
  
  // Test 3: Supabase connection
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url') {
    console.log('\n3️⃣ Testando conexão com Supabase...');
    
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Test storage
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.log('❌ Erro ao conectar com Supabase:', error.message);
      } else {
        console.log('✅ Conexão com Supabase: OK');
        
        const studentDocsBucket = buckets?.find(b => b.name === 'student-documents');
        if (studentDocsBucket) {
          console.log('✅ Bucket "student-documents": Encontrado');
        } else {
          console.log('⚠️  Bucket "student-documents": Não encontrado');
          console.log('💡 Execute: npm run setup:supabase');
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao testar Supabase:', error.message);
    }
  } else {
    console.log('\n3️⃣ Supabase não configurado - pulando teste');
  }
  
  // Test 4: Environment summary
  console.log('\n📋 Resumo da Configuração:');
  console.log('='.repeat(40));
  
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL: Configurada');
  } else {
    console.log('❌ DATABASE_URL: Não configurada');
  }
  
  console.log('\n🎯 Próximos passos:');
  
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    console.log('1. Configure o Supabase no .env.local');
    console.log('2. Execute: npm run setup:supabase');
  } else {
    console.log('1. Sistema configurado e funcionando!');
    console.log('2. Execute: npm run dev');
  }
  
  console.log('\n📚 Veja: SUPABASE_SETUP.md para instruções completas');
}

if (require.main === module) {
  testSystem().catch(console.error);
}

module.exports = { testSystem };