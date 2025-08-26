const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupSupabaseBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key needed for admin operations
  
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurada no .env.local');
    return;
  }
  
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local');
    console.log('💡 Você precisa adicionar a Service Role Key do Supabase no .env.local');
    console.log('💡 Encontre ela em: Supabase Dashboard > Settings > API > service_role key');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Verificando se bucket já existe...');
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'student-documents');
    
    if (bucketExists) {
      console.log('✅ Bucket "student-documents" já existe!');
      return;
    }

    console.log('🔄 Criando bucket "student-documents"...');
    
    // Create the bucket
    const { error: createError } = await supabase.storage.createBucket('student-documents', {
      public: true,
      allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (createError) {
      console.error('❌ Erro ao criar bucket:', createError);
      return;
    }

    console.log('✅ Bucket "student-documents" criado com sucesso!');
    
    // Test upload to verify bucket is working
    console.log('🔄 Testando upload...');
    
    const testFile = new File(['Test content'], 'test.txt', { type: 'text/plain' });
    const { error: uploadError } = await supabase.storage
      .from('student-documents')
      .upload('test/test.txt', testFile);
      
    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
      return;
    }
    
    console.log('✅ Teste de upload bem-sucedido!');
    
    // Clean up test file
    await supabase.storage
      .from('student-documents')
      .remove(['test/test.txt']);
      
    console.log('🎉 Configuração do Supabase concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

if (require.main === module) {
  setupSupabaseBucket();
}

module.exports = { setupSupabaseBucket };