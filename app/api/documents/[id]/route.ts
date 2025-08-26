import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/supabase'

// DELETE - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // First, get the document to check if it has a file URL
    const document = await prisma.documentUpload.findUnique({
      where: { id }
    })
    
    if (!document) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }
    
    // If document has a file URL, try to delete it from storage
    if (document.fileUrl) {
      try {
        // Extract file path from URL for deletion
        const url = new URL(document.fileUrl)
        const pathParts = url.pathname.split('/')
        const bucket = pathParts[pathParts.length - 2]
        const fileName = pathParts[pathParts.length - 1]
        
        if (bucket && fileName) {
          await deleteFile(bucket, fileName)
        }
      } catch (storageError) {
        console.log('Erro ao deletar arquivo do storage, mas documento será removido do banco:', storageError)
      }
    }
    
    // Delete document from database
    await prisma.documentUpload.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Documento excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Falha ao excluir documento' }, { status: 500 })
  }
}

// GET - Get document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const document = await prisma.documentUpload.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (!document) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Falha ao buscar documento' }, { status: 500 })
  }
}