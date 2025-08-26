import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const studentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  documentType: z.enum(['RG', 'CIN', 'BIRTH_CERTIFICATE']),
  documentNumber: z.string().min(1, 'Número do documento é obrigatório'),
  cpf: z.string().optional(),
  birthDate: z.union([z.string(), z.date()]).transform((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
  fatherName: z.string().optional(),
  motherName: z.string().min(1, 'Nome da mãe é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  zipCode: z.string().min(1, 'CEP é obrigatório'),
  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  imageRights: z.boolean().default(false),
  hasAllergies: z.boolean().default(false),
  allergyDescription: z.string().optional(),
})

async function generateEnrollment() {
  const currentYear = new Date().getFullYear()
  
  // Find the highest enrollment number for the current year (format: GASI xxx/yyyy)
  const lastStudent = await prisma.student.findFirst({
    where: {
      enrollment: {
        startsWith: 'GASI',
        endsWith: `/${currentYear}`
      }
    },
    orderBy: {
      enrollment: 'desc'
    }
  })
  
  let nextNumber = 1
  if (lastStudent) {
    // Extract the number from the enrollment (format: GASI xxx/yyyy)
    const enrollmentParts = lastStudent.enrollment.replace('GASI ', '').split('/')
    if (enrollmentParts.length === 2) {
      const lastNumber = parseInt(enrollmentParts[0])
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1
      }
    }
  }
  
  // Format with leading zeros (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0')
  return `GASI ${formattedNumber}/${currentYear}`
}

// GET - List all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        documents: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Falha ao buscar alunos' }, { status: 500 })
  }
}

// POST - Create new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = studentSchema.parse(body)
    
    // Generate unique enrollment number
    const enrollment = await generateEnrollment()
    
    const student = await prisma.student.create({
      data: {
        ...validatedData,
        enrollment,
      }
    })
    
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Falha ao criar aluno' }, { status: 500 })
  }
}