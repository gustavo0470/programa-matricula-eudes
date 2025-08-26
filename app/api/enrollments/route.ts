import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const enrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID é obrigatório'),
  courseId: z.string().min(1, 'Course ID é obrigatório'),
  weekdays: z.array(z.string()).min(1, 'Pelo menos um dia da semana é obrigatório'),
  schedule: z.string().min(1, 'Horário é obrigatório'),
})

// POST - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = enrollmentSchema.parse(body)
    
    // Check if student is already enrolled in this course
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: validatedData.studentId,
        courseId: validatedData.courseId,
        status: 'ACTIVE'
      }
    })
    
    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }
    
    const enrollment = await prisma.enrollment.create({
      data: validatedData,
      include: {
        student: true,
        course: true
      }
    })
    
    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    
    console.error('Error creating enrollment:', error)
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }
}