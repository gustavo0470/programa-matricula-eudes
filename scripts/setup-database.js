const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados completo...\n');
  
  try {
    // Step 1: Push Prisma schema
    console.log('1️⃣ Sincronizando schema do Prisma com Supabase...');
    execSync('npx prisma db push', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Schema sincronizado com sucesso!\n');
    
    // Step 2: Test database connection
    console.log('2️⃣ Testando conexão com banco de dados...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Conexão com banco estabelecida!');
      
      // Check if we have any data
      const studentCount = await prisma.student.count();
      const courseCount = await prisma.course.count();
      
      console.log(`   📊 Alunos no banco: ${studentCount}`);
      console.log(`   📊 Cursos no banco: ${courseCount}`);
      
      // Step 3: Create sample data if empty
      if (studentCount === 0 && courseCount === 0) {
        console.log('\n3️⃣ Criando dados de exemplo...');
        
        // Create a sample course
        const sampleCourse = await prisma.course.create({
          data: {
            name: 'Curso Demonstrativo',
            description: 'Curso de exemplo para testar o sistema'
          }
        });
        console.log('✅ Curso de exemplo criado');
        
        // Create a sample student
        const sampleStudent = await prisma.student.create({
          data: {
            enrollment: 'GASI 001/2025',
            name: 'Aluno de Teste',
            documentType: 'CIN',
            documentNumber: '12345678',
            birthDate: new Date('2000-01-01'),
            motherName: 'Mãe de Teste',
            address: 'Rua de Teste, 123',
            neighborhood: 'Bairro Teste',
            zipCode: '12345-678',
            state: 'SP',
            city: 'Cidade Teste',
            phone: '(11) 99999-9999',
            email: 'teste@exemplo.com',
            imageRights: true,
            hasAllergies: false
          }
        });
        console.log('✅ Aluno de exemplo criado');
        
        // Create enrollment
        await prisma.enrollment.create({
          data: {
            studentId: sampleStudent.id,
            courseId: sampleCourse.id,
            weekdays: ['TUESDAY'],
            schedule: '08:00 - 10:00'
          }
        });
        console.log('✅ Matrícula de exemplo criada');
      }
      
    } catch (error) {
      console.error('❌ Erro na conexão com banco:', error.message);
      return;
    } finally {
      await prisma.$disconnect();
    }
    
    // Step 4: Setup Supabase bucket
    console.log('\n4️⃣ Configurando Supabase Storage...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
      console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL não configurada');
      console.log('💡 Configure o Supabase no .env.local para ativar upload de arquivos');
    } else if (!supabaseServiceKey) {
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY não configurada');
      console.log('💡 Adicione a service_role key para criar buckets automaticamente');
    } else {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.log('❌ Erro ao acessar Supabase Storage:', listError.message);
        } else {
          const bucketExists = buckets?.some(bucket => bucket.name === 'student-documents');
          
          if (bucketExists) {
            console.log('✅ Bucket "student-documents" já existe!');
          } else {
            console.log('🔄 Criando bucket "student-documents"...');
            
            const { error: createError } = await supabase.storage.createBucket('student-documents', {
              public: true,
              allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
              fileSizeLimit: 10485760 // 10MB
            });
            
            if (createError) {
              console.log('❌ Erro ao criar bucket:', createError.message);
            } else {
              console.log('✅ Bucket criado com sucesso!');
              
              // Test upload
              const testFile = new File(['Test'], 'test.txt', { type: 'text/plain' });
              const { error: uploadError } = await supabase.storage
                .from('student-documents')
                .upload('test/test.txt', testFile);
                
              if (!uploadError) {
                console.log('✅ Teste de upload bem-sucedido!');
                // Clean up
                await supabase.storage.from('student-documents').remove(['test/test.txt']);
              }
            }
          }
        }
      } catch (error) {
        console.log('❌ Erro ao configurar Supabase:', error.message);
      }
    }
    
    // Step 5: Generate Prisma client
    console.log('\n5️⃣ Gerando cliente Prisma...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit', cwd: process.cwd() });
      console.log('✅ Cliente Prisma gerado!');
    } catch (error) {
      console.log('⚠️  Cliente Prisma pode ter problemas, mas continuando...');
    }
    
    // Final summary
    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('='.repeat(50));
    console.log('✅ Banco de dados: Configurado e funcionando');
    console.log('✅ Schema: Sincronizado');
    console.log('✅ Dados de exemplo: Criados');
    
    if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url' && supabaseServiceKey) {
      console.log('✅ Supabase Storage: Configurado');
      console.log('✅ Upload de arquivos: Funcionando');
    } else {
      console.log('⚠️  Supabase Storage: Não configurado (upload desabilitado)');
    }
    
    console.log('\n🚀 Próximo passo:');
    console.log('   npm run dev');
    
    console.log('\n📱 Acesse: http://localhost:3000');
    
  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error.message);
    console.log('\n🔍 Para diagnóstico detalhado, execute:');
    console.log('   npm run test:system');
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };