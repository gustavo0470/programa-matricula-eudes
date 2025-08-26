import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const studentUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  documentType: z.enum(['RG', 'CIN', 'BIRTH_CERTIFICATE']).optional(),
  documentNumber: z.string().min(1, 'Número do documento é obrigatório').optional(),
  cpf: z.string().nullable().optional(),
  birthDate: z.string().transform((val) => new Date(val)).optional(),
  fatherName: z.string().nullable().optional(),
  motherName: z.string().min(1, 'Nome da mãe é obrigatório').optional(),
  address: z.string().min(1, 'Endereço é obrigatório').optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').optional(),
  zipCode: z.string().min(1, 'CEP é obrigatório').optional(),
  state: z.string().min(1, 'Estado é obrigatório').optional(),
  city: z.string().min(1, 'Cidade é obrigatória').optional(),
  phone: z.string().min(1, 'Telefone é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  imageRights: z.boolean().optional(),
  hasAllergies: z.boolean().optional(),
  allergyDescription: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CANCELLED']).optional(),
})

// GET - Get student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        documents: true
      }
    })
    
    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Falha ao buscar aluno' }, { status: 500 })
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    console.log('PUT request body:', body)
    
    const validatedData = studentUpdateSchema.parse(body)
    
    console.log('Validated data:', validatedData)
    
    // Check if student exists first
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    })
    
    if (!existingStudent) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    
    const student = await prisma.student.update({
      where: { id },
      data: validatedData,
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        documents: true
      }
    })
    
    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Zod validation error:', error.issues)
      return NextResponse.json({ 
        error: 'Erro de validação', 
        details: error.issues,
        message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }, { status: 400 })
    }
    
    console.error('Error updating student:', error)
    return NextResponse.json({ 
      error: 'Falha ao atualizar aluno',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.student.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Aluno excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Falha ao excluir aluno' }, { status: 500 })
  }
}