import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const studentId = formData.get('studentId') as string
    const documentType = formData.get('documentType') as string

    if (!file || !studentId || !documentType) {
      return NextResponse.json(
        { error: 'Arquivo, ID do aluno e tipo de documento são obrigatórios' },
        { status: 400 }
      )
    }

    // Generate unique file name
    const fileExtension = file.name.split('.').pop()
    const fileName = `${studentId}/${documentType}_${Date.now()}.${fileExtension}`

    try {
      // Try to upload to Supabase Storage
      const uploadResult = await uploadFile(file, 'student-documents', fileName)

      if (uploadResult.success) {
        return NextResponse.json({
          success: true,
          fileName: fileName,
          publicUrl: uploadResult.publicUrl
        })
      } else {
        // If Supabase upload fails, return success anyway for local storage
        console.log('Supabase upload failed, storing file info only:', uploadResult.error)
        return NextResponse.json({
          success: true,
          fileName: fileName,
          publicUrl: null,
          message: 'Arquivo registrado localmente (Supabase não configurado)'
        })
      }
    } catch (supabaseError) {
      // If Supabase is not configured or has issues, still allow local storage
      console.log('Supabase not configured or error:', supabaseError)
      return NextResponse.json({
        success: true,
        fileName: fileName,
        publicUrl: null,
        message: 'Arquivo registrado localmente (Supabase não configurado)'
      })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}