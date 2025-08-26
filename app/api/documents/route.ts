import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const documentSchema = z.object({
  studentId: z.string().min(1, 'Student ID é obrigatório'),
  documentType: z.string().min(1, 'Document type é obrigatório'),
  filename: z.string().min(1, 'Filename é obrigatório'),
  fileUrl: z.string().min(1, 'File URL é obrigatório'),
  fileType: z.string().min(1, 'File type é obrigatório'),
  isSubmitted: z.boolean().default(false),
})

// POST - Create new document record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Document POST body:', body)
    
    const validatedData = documentSchema.parse(body)
    console.log('Document validated data:', validatedData)
    
    const document = await prisma.documentUpload.create({
      data: validatedData
    })
    
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Document Zod validation error:', error.issues)
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    
    console.error('Error creating document:', error)
    return NextResponse.json({ 
      error: 'Failed to create document',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - List documents for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }
    
    const documents = await prisma.documentUpload.findMany({
      where: { studentId },
      orderBy: { uploadedAt: 'desc' }
    })
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}