import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const enrollmentUpdateSchema = z.object({
  courseId: z.string().min(1, 'Course ID é obrigatório').optional(),
  weekdays: z.array(z.string()).min(1, 'Pelo menos um dia da semana é obrigatório').optional(),
  schedule: z.string().min(1, 'Horário é obrigatório').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CANCELLED']).optional(),
})

// PUT - Update enrollment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = enrollmentUpdateSchema.parse(body)
    
    // Check if enrollment exists first
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id }
    })
    
    if (!existingEnrollment) {
      return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })
    }
    
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: validatedData,
      include: {
        student: true,
        course: true
      }
    })
    
    return NextResponse.json(enrollment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ error: 'Falha ao atualizar matrícula' }, { status: 500 })
  }
}

// DELETE - Delete enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.enrollment.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Matrícula excluída com sucesso' })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json({ error: 'Falha ao excluir matrícula' }, { status: 500 })
  }
}