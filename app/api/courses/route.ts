import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const courseSchema = z.object({
  name: z.string().min(1, 'Nome do curso é obrigatório'),
  description: z.string().optional(),
})

// GET - List all courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    const coursesWithCount = courses.map(course => ({
      ...course,
      studentsCount: course._count.enrollments
    }))
    
    return NextResponse.json(coursesWithCount)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Falha ao buscar cursos' }, { status: 500 })
  }
}

// POST - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = courseSchema.parse(body)
    
    const course = await prisma.course.create({
      data: validatedData
    })
    
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Falha ao criar curso' }, { status: 500 })
  }
}