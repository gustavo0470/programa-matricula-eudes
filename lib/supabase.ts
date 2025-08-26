import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null
let supabaseAdmin: any = null

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Create admin client for bucket operations if service key is available
    if (supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    }
  } catch (error) {
    console.log('Supabase não configurado corretamente:', error)
    supabase = null
    supabaseAdmin = null
  }
} else {
  console.log('Supabase não configurado - usando apenas storage local')
}

export { supabase }

export const ensureBucketExists = async (bucketName: string) => {
  // Use admin client for bucket operations if available, otherwise regular client
  const client = supabaseAdmin || supabase
  
  if (!client) {
    console.log('Supabase não configurado - pulando criação de bucket')
    return false
  }
  
  try {
    const { data: buckets, error: listError } = await client.storage.listBuckets()
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError)
      return false
    }
    
    const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName)
    
    if (!bucketExists) {
      const { error: createError } = await client.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error('Erro ao criar bucket:', createError)
        return false
      }
      
      console.log(`Bucket '${bucketName}' criado com sucesso`)
    }
    
    return true
  } catch (error) {
    console.error('Erro ao verificar/criar bucket:', error)
    return false
  }
}

export const uploadFile = async (file: File, bucket: string, path: string) => {
  // Use admin client for file operations if available, otherwise regular client
  const client = supabaseAdmin || supabase
  
  if (!client) {
    return {
      success: false,
      error: 'Supabase não configurado'
    }
  }

  try {
    // Ensure bucket exists before uploading
    const bucketReady = await ensureBucketExists(bucket)
    
    if (!bucketReady) {
      return {
        success: false,
        error: 'Falha ao preparar o storage. Verifique a configuração do Supabase.'
      }
    }

    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    const { data: publicData } = client.storage
      .from(bucket)
      .getPublicUrl(path)

    return {
      success: true,
      data: data,
      publicUrl: publicData.publicUrl
    }
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error)
    return {
      success: false,
      error: error
    }
  }
}

export const deleteFile = async (bucket: string, path: string) => {
  // Use admin client for file operations if available, otherwise regular client
  const client = supabaseAdmin || supabase
  
  if (!client) {
    return {
      success: false,
      error: 'Supabase não configurado'
    }
  }

  try {
    const { error } = await client.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      error: error
    }
  }
}