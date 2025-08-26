import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'

// Helper function to add header to PDF pages
function addPDFHeader(doc: jsPDF, title: string, pageNumber: number = 1) {
  // Add logo
  try {
    const fs = require('fs')
    const path = require('path')
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuffer = fs.readFileSync(logoPath)
    const logoBase64 = 'data:image/png;base64,' + logoBuffer.toString('base64')
    doc.addImage(logoBase64, 'PNG', 20, 15, 25, 25)
  } catch (error) {
    console.log('Logo not available:', error)
  }
  
  // Header text
  doc.setFontSize(16)
  doc.text('ONG Grupo Ação Solidária de Indiaporã', 50, 25)
  doc.setFontSize(10)
  doc.text('CNPJ: 05.902.921/0001-63', 50, 32)
  doc.text('Rua Manoel Urquiza Nogueira - Quadra Dois, 08', 50, 37)
  doc.text('Centro - CEP 15690-134 - Indiaporã/SP', 50, 42)
  
  // Title
  doc.setFontSize(14)
  doc.text(title, 105, 60, { align: 'center' })
  const now = new Date()
  doc.setFontSize(8)
  doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 105, 68, { align: 'center' })
  
  // Page number (if not first page)
  if (pageNumber > 1) {
    doc.setFontSize(8)
    doc.text(`Página ${pageNumber}`, 190, 15, { align: 'right' })
  }
  
  return 85 // Return starting Y position for content
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    const { searchParams } = new URL(request.url)
    const reportType = type

    let pdfBuffer: Buffer

    switch (reportType) {
      case 'student': {
        const studentId = searchParams.get('studentId')
        if (!studentId) {
          return NextResponse.json({ error: 'ID do aluno é obrigatório' }, { status: 400 })
        }

        const student = await prisma.student.findUnique({
          where: { id: studentId },
          include: {
            enrollments: {
              include: {
                course: true
              }
            }
          }
        })

        if (!student) {
          return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
        }

        // Generate PDF using jsPDF
        const doc = new jsPDF()
        let yPos = addPDFHeader(doc, 'Relatório do Aluno')
        
        // Student info
        doc.setFontSize(12)
        doc.text('Dados Pessoais', 20, yPos)
        
        yPos += 10
        doc.setFontSize(10)
        doc.text(`Nome: ${student.name}`, 20, yPos)
        yPos += 6
        doc.text(`Matrícula: ${student.enrollment}`, 20, yPos)
        yPos += 6
        const documentTypeLabels = {
          'RG': 'RG',
          'CIN': 'Carteira de Identidade Nacional',
          'BIRTH_CERTIFICATE': 'Certidão de Nascimento'
        }
        const documentTypeLabel = documentTypeLabels[student.documentType as keyof typeof documentTypeLabels] || student.documentType
        doc.text(`Documento: ${documentTypeLabel}: ${student.documentNumber}`, 20, yPos)
        if (student.cpf) {
          yPos += 6
          doc.text(`CPF: ${student.cpf}`, 20, yPos)
        }
        yPos += 6
        doc.text(`Data de Nascimento: ${new Date(student.birthDate).toLocaleDateString('pt-BR')}`, 20, yPos)
        yPos += 6
        doc.text(`Nome da Mãe: ${student.motherName}`, 20, yPos)
        if (student.fatherName) {
          yPos += 6
          doc.text(`Nome do Pai: ${student.fatherName}`, 20, yPos)
        }
        yPos += 6
        doc.text(`Endereço: ${student.address}, ${student.neighborhood}`, 20, yPos)
        yPos += 6
        doc.text(`Cidade/Estado: ${student.city}/${student.state} - CEP: ${student.zipCode}`, 20, yPos)
        yPos += 6
        doc.text(`Telefone: ${student.phone}`, 20, yPos)
        yPos += 6
        doc.text(`E-mail: ${student.email}`, 20, yPos)
        yPos += 6
        const studentStatusLabels = {
          'ACTIVE': 'Ativo',
          'INACTIVE': 'Inativo', 
          'CANCELLED': 'Cancelado'
        }
        const studentStatusLabel = studentStatusLabels[student.status as keyof typeof studentStatusLabels] || student.status
        doc.text(`Status: ${studentStatusLabel}`, 20, yPos)
        
        // Enrollments
        if (student.enrollments && student.enrollments.length > 0) {
          yPos += 15
          doc.setFontSize(12)
          doc.text('Matrículas', 20, yPos)
          
          yPos += 10
          doc.setFontSize(9)
          student.enrollments.forEach((enrollment) => {
            doc.text(`Curso: ${enrollment.course?.name || 'Não informado'}`, 20, yPos)
            yPos += 5
            const weekdayLabels = {
              'MONDAY': 'Segunda-feira',
              'TUESDAY': 'Terça-feira', 
              'WEDNESDAY': 'Quarta-feira',
              'THURSDAY': 'Quinta-feira',
              'FRIDAY': 'Sexta-feira',
              'SATURDAY': 'Sábado',
              'SUNDAY': 'Domingo'
            }
            const translatedWeekdays = enrollment.weekdays?.map(day => weekdayLabels[day as keyof typeof weekdayLabels] || day).join(', ') || 'Não informado'
            doc.text(`Dias: ${translatedWeekdays}`, 20, yPos)
            yPos += 5
            doc.text(`Horário: ${enrollment.schedule || 'Não informado'}`, 20, yPos)
            yPos += 5
            const enrollmentStatusLabels = {
              'ACTIVE': 'Ativa',
              'INACTIVE': 'Inativa', 
              'CANCELLED': 'Cancelada'
            }
            const enrollmentStatusLabel = enrollmentStatusLabels[enrollment.status as keyof typeof enrollmentStatusLabels] || enrollment.status
            doc.text(`Status: ${enrollmentStatusLabel}`, 20, yPos)
            yPos += 8
          })
        }
        
        // Footer
        doc.setFontSize(8)
        doc.text('Relatório gerado pelo Sistema de Matrículas - ONG Grupo Ação Solidária de Indiaporã', 105, 280, { align: 'center' })

        pdfBuffer = Buffer.from(doc.output('arraybuffer'))
        break
      }

      case 'course': {
        const courseId = searchParams.get('courseId')
        if (!courseId) {
          return NextResponse.json({ error: 'ID do curso é obrigatório' }, { status: 400 })
        }

        const course = await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            enrollments: {
              include: {
                student: true
              }
            }
          }
        })

        if (!course) {
          return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
        }

        const doc = new jsPDF()
        let yPos = addPDFHeader(doc, `Relatório do Curso: ${course.name}`)
        
        // Course info
        doc.setFontSize(12)
        doc.text('Informações do Curso', 20, yPos)
        
        yPos += 10
        doc.setFontSize(10)
        doc.text(`Nome: ${course.name}`, 20, yPos)
        if (course.description) {
          yPos += 6
          doc.text(`Descrição: ${course.description}`, 20, yPos)
        }
        yPos += 6
        doc.text(`Total de Alunos Matriculados: ${course.enrollments?.length || 0}`, 20, yPos)
        
        // Students
        yPos += 15
        doc.setFontSize(12)
        doc.text('Alunos Matriculados', 20, yPos)
        
        yPos += 10
        doc.setFontSize(9)
        if (course.enrollments && course.enrollments.length > 0) {
          course.enrollments.forEach((enrollment, index) => {
            // Student header
            doc.setFontSize(10)
            doc.text(`${index + 1}. ${enrollment.student.name}`, 20, yPos)
            yPos += 6
            
            doc.setFontSize(8)
            doc.text(`Matrícula: ${enrollment.student.enrollment}`, 25, yPos)
            yPos += 4
            const documentTypeLabels = {
              'RG': 'RG',
              'CIN': 'Carteira de Identidade Nacional',
              'BIRTH_CERTIFICATE': 'Certidão de Nascimento'
            }
            const documentTypeLabel = documentTypeLabels[enrollment.student.documentType as keyof typeof documentTypeLabels] || enrollment.student.documentType
            doc.text(`Documento: ${documentTypeLabel}: ${enrollment.student.documentNumber}`, 25, yPos)
            yPos += 4
            if (enrollment.student.cpf) {
              doc.text(`CPF: ${enrollment.student.cpf}`, 25, yPos)
              yPos += 4
            }
            doc.text(`Data de Nascimento: ${new Date(enrollment.student.birthDate).toLocaleDateString('pt-BR')}`, 25, yPos)
            yPos += 4
            doc.text(`Telefone: ${enrollment.student.phone}`, 25, yPos)
            yPos += 4
            doc.text(`E-mail: ${enrollment.student.email}`, 25, yPos)
            yPos += 4
            doc.text(`Endereço: ${enrollment.student.address}, ${enrollment.student.neighborhood}`, 25, yPos)
            yPos += 4
            doc.text(`Cidade/Estado: ${enrollment.student.city}/${enrollment.student.state} - CEP: ${enrollment.student.zipCode}`, 25, yPos)
            yPos += 4
            doc.text(`Nome da Mãe: ${enrollment.student.motherName}`, 25, yPos)
            if (enrollment.student.fatherName) {
              yPos += 4
              doc.text(`Nome do Pai: ${enrollment.student.fatherName}`, 25, yPos)
            }
            yPos += 4
            const weekdayLabels = {
              'MONDAY': 'Segunda-feira',
              'TUESDAY': 'Terça-feira', 
              'WEDNESDAY': 'Quarta-feira',
              'THURSDAY': 'Quinta-feira',
              'FRIDAY': 'Sexta-feira',
              'SATURDAY': 'Sábado',
              'SUNDAY': 'Domingo'
            }
            const translatedWeekdays = enrollment.weekdays?.map(day => weekdayLabels[day as keyof typeof weekdayLabels] || day).join(', ') || 'Não informado'
            doc.text(`Dias da Semana: ${translatedWeekdays}`, 25, yPos)
            yPos += 4
            doc.text(`Horário: ${enrollment.schedule || 'Não informado'}`, 25, yPos)
            yPos += 4
            const statusLabels = {
              'ACTIVE': 'Ativa',
              'INACTIVE': 'Inativa', 
              'CANCELLED': 'Cancelada'
            }
            const statusLabel = statusLabels[enrollment.status as keyof typeof statusLabels] || enrollment.status
            doc.text(`Status da Matrícula: ${statusLabel}`, 25, yPos)
            yPos += 4
            doc.text(`Data da Matrícula: ${new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}`, 25, yPos)
            yPos += 8
            
            if (yPos > 250) {
              doc.addPage()
              yPos = addPDFHeader(doc, 'Relatório do Curso (continuação)', 2)
            }
          })
        } else {
          doc.text('Nenhum aluno matriculado neste curso.', 20, yPos)
        }
        
        // Footer
        doc.setFontSize(8)
        doc.text('Relatório gerado pelo Sistema de Matrículas - ONG Grupo Ação Solidária de Indiaporã', 105, 280, { align: 'center' })

        pdfBuffer = Buffer.from(doc.output('arraybuffer'))
        break
      }

      case 'period': {
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Data inicial e final são obrigatórias' }, { status: 400 })
        }

        const students = await prisma.student.findMany({
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          include: {
            enrollments: {
              include: {
                course: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        const doc = new jsPDF()
        let yPos = addPDFHeader(doc, `Relatório por Período: ${new Date(startDate).toLocaleDateString('pt-BR')} - ${new Date(endDate).toLocaleDateString('pt-BR')}`)
        
        // Statistics
        doc.setFontSize(12)
        doc.text('Estatísticas do Período', 20, yPos)
        yPos += 10
        
        doc.setFontSize(10)
        doc.text(`Total de alunos cadastrados: ${students.length}`, 20, yPos)
        yPos += 6
        
        const activeStudents = students.filter(s => s.status === 'ACTIVE').length
        doc.text(`Alunos ativos: ${activeStudents}`, 20, yPos)
        yPos += 6
        
        const totalEnrollments = students.reduce((acc, student) => 
          acc + (student.enrollments?.length || 0), 0)
        doc.text(`Total de matrículas: ${totalEnrollments}`, 20, yPos)
        yPos += 15
        
        // Students list
        if (students.length > 0) {
          doc.setFontSize(12)
          doc.text('Alunos Cadastrados no Período', 20, yPos)
          yPos += 10
          
          doc.setFontSize(9)
          students.forEach((student, index) => {
            if (yPos > 250) {
              doc.addPage()
              yPos = addPDFHeader(doc, 'Relatório por Período (continuação)', 2)
            }
            
            doc.text(`${index + 1}. ${student.name} - ${student.enrollment}`, 20, yPos)
            yPos += 5
            doc.text(`   Cadastrado em: ${new Date(student.createdAt).toLocaleDateString('pt-BR')}`, 25, yPos)
            yPos += 5
            doc.text(`   Status: ${student.status === 'ACTIVE' ? 'Ativo' : student.status === 'INACTIVE' ? 'Inativo' : 'Cancelado'}`, 25, yPos)
            yPos += 8
          })
        }
        
        pdfBuffer = Buffer.from(doc.output('arraybuffer'))
        break
      }

      case 'monthly': {
        const month = searchParams.get('month')
        const year = searchParams.get('year')
        
        if (!month || !year) {
          return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 })
        }

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
        
        const students = await prisma.student.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            enrollments: {
              include: {
                course: true
              }
            }
          }
        })

        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]

        const doc = new jsPDF()
        let yPos = addPDFHeader(doc, `Relatório Mensal: ${monthNames[parseInt(month) - 1]} de ${year}`)
        
        // Statistics
        doc.setFontSize(12)
        doc.text('Estatísticas do Mês', 20, yPos)
        yPos += 10
        
        doc.setFontSize(10)
        doc.text(`Novos alunos cadastrados: ${students.length}`, 20, yPos)
        yPos += 6
        
        const courseStats = students.reduce((acc: any, student) => {
          student.enrollments?.forEach(enrollment => {
            const courseName = enrollment.course?.name || 'Sem curso'
            acc[courseName] = (acc[courseName] || 0) + 1
          })
          return acc
        }, {})
        
        doc.text('Matrículas por curso:', 20, yPos)
        yPos += 6
        
        Object.entries(courseStats).forEach(([course, count]) => {
          doc.text(`  • ${course}: ${count}`, 25, yPos)
          yPos += 5
        })
        
        // Detailed student list
        if (students.length > 0) {
          yPos += 15
          doc.setFontSize(12)
          doc.text('Lista Detalhada de Alunos Cadastrados', 20, yPos)
          yPos += 10
          
          doc.setFontSize(8)
          students.forEach((student, index) => {
            if (yPos > 250) {
              doc.addPage()
              yPos = addPDFHeader(doc, 'Relatório Mensal (continuação)', 2)
            }
            
            doc.text(`${index + 1}. ${student.name} - Matrícula: ${student.enrollment}`, 20, yPos)
            yPos += 4
            
            const documentTypeLabels = {
              'RG': 'RG',
              'CIN': 'CIN',
              'BIRTH_CERTIFICATE': 'Certidão de Nascimento'
            }
            const docType = documentTypeLabels[student.documentType as keyof typeof documentTypeLabels] || student.documentType
            doc.text(`   Documento: ${docType}: ${student.documentNumber}`, 25, yPos)
            yPos += 4
            
            if (student.cpf) {
              doc.text(`   CPF: ${student.cpf}`, 25, yPos)
              yPos += 4
            }
            
            doc.text(`   Nascimento: ${new Date(student.birthDate).toLocaleDateString('pt-BR')}`, 25, yPos)
            yPos += 4
            doc.text(`   Telefone: ${student.phone} | E-mail: ${student.email}`, 25, yPos)
            yPos += 4
            doc.text(`   Endereço: ${student.address}, ${student.neighborhood} - ${student.city}/${student.state}`, 25, yPos)
            yPos += 4
            doc.text(`   Nome da Mãe: ${student.motherName}`, 25, yPos)
            if (student.fatherName) {
              yPos += 4
              doc.text(`   Nome do Pai: ${student.fatherName}`, 25, yPos)
            }
            yPos += 4
            
            // Show all enrollments
            if (student.enrollments && student.enrollments.length > 0) {
              doc.text(`   Cursos Matriculados:`, 25, yPos)
              yPos += 4
              
              student.enrollments.forEach((enrollment) => {
                doc.text(`     • ${enrollment.course?.name || 'Não informado'}`, 30, yPos)
                yPos += 3
                
                const weekdayLabels = {
                  'MONDAY': 'Seg', 'TUESDAY': 'Ter', 'WEDNESDAY': 'Qua',
                  'THURSDAY': 'Qui', 'FRIDAY': 'Sex', 'SATURDAY': 'Sáb', 'SUNDAY': 'Dom'
                }
                const days = enrollment.weekdays?.map(day => weekdayLabels[day as keyof typeof weekdayLabels] || day).join(', ') || 'Não informado'
                doc.text(`       Dias: ${days} | Horário: ${enrollment.schedule || 'Não informado'}`, 30, yPos)
                yPos += 3
              })
            }
            
            doc.text(`   Cadastrado em: ${new Date(student.createdAt).toLocaleDateString('pt-BR')}`, 25, yPos)
            yPos += 8
          })
        }
        
        pdfBuffer = Buffer.from(doc.output('arraybuffer'))
        break
      }

      case 'yearly': {
        const year = searchParams.get('year')
        
        if (!year) {
          return NextResponse.json({ error: 'Ano é obrigatório' }, { status: 400 })
        }

        const startDate = new Date(parseInt(year), 0, 1)
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
        
        const students = await prisma.student.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            enrollments: {
              include: {
                course: true
              }
            }
          }
        })

        const courses = await prisma.course.findMany({
          include: {
            enrollments: {
              where: {
                student: {
                  createdAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          }
        })

        const doc = new jsPDF()
        let yPos = addPDFHeader(doc, `Relatório Anual: ${year}`)
        
        // General statistics
        doc.setFontSize(12)
        doc.text('Resumo Geral', 20, yPos)
        yPos += 10
        
        doc.setFontSize(10)
        doc.text(`Total de alunos cadastrados em ${year}: ${students.length}`, 20, yPos)
        yPos += 6
        doc.text(`Total de cursos ativos: ${courses.length}`, 20, yPos)
        yPos += 6
        
        const totalEnrollments = students.reduce((acc, student) => 
          acc + (student.enrollments?.length || 0), 0)
        doc.text(`Total de matrículas realizadas: ${totalEnrollments}`, 20, yPos)
        yPos += 15
        
        // Monthly breakdown
        doc.setFontSize(12)
        doc.text('Cadastros por Mês', 20, yPos)
        yPos += 10
        
        const monthlyStats = Array.from({ length: 12 }, (_, i) => {
          const monthStart = new Date(parseInt(year), i, 1)
          const monthEnd = new Date(parseInt(year), i + 1, 0, 23, 59, 59)
          const count = students.filter(s => s.createdAt >= monthStart && s.createdAt <= monthEnd).length
          return { month: i + 1, count }
        })
        
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]
        
        doc.setFontSize(9)
        monthlyStats.forEach(({ month, count }) => {
          doc.text(`${monthNames[month - 1]}: ${count} alunos`, 20, yPos)
          yPos += 5
        })
        
        // Course statistics
        yPos += 10
        doc.setFontSize(12)
        doc.text('Estatísticas por Curso', 20, yPos)
        yPos += 10
        
        const courseStats = students.reduce((acc: any, student) => {
          student.enrollments?.forEach(enrollment => {
            const courseName = enrollment.course?.name || 'Sem curso'
            if (!acc[courseName]) {
              acc[courseName] = { count: 0, students: [] }
            }
            acc[courseName].count += 1
            acc[courseName].students.push(student.name)
          })
          return acc
        }, {})
        
        doc.setFontSize(10)
        Object.entries(courseStats).forEach(([course, data]: [string, any]) => {
          doc.text(`${course}: ${data.count} matrículas`, 20, yPos)
          yPos += 6
        })
        
        // Complete student list with all details
        yPos += 15
        doc.setFontSize(12)
        doc.text('Lista Completa de Alunos Cadastrados em ' + year, 20, yPos)
        yPos += 10
        
        if (students.length > 0) {
          doc.setFontSize(8)
          students.forEach((student, index) => {
            if (yPos > 240) {
              doc.addPage()
              yPos = addPDFHeader(doc, `Relatório Anual ${year} (continuação)`, 2)
            }
            
            doc.setFontSize(9)
            doc.text(`${index + 1}. ${student.name} - Matrícula: ${student.enrollment}`, 20, yPos)
            yPos += 5
            
            doc.setFontSize(8)
            const docType = student.documentType === 'RG' ? 'RG' : student.documentType === 'CIN' ? 'CIN' : 'Certidão de Nascimento'
            doc.text(`   ${docType}: ${student.documentNumber}${student.cpf ? ' | CPF: ' + student.cpf : ''}`, 25, yPos)
            yPos += 4
            doc.text(`   Nascimento: ${new Date(student.birthDate).toLocaleDateString('pt-BR')} | Telefone: ${student.phone}`, 25, yPos)
            yPos += 4
            doc.text(`   E-mail: ${student.email}`, 25, yPos)
            yPos += 4
            doc.text(`   ${student.address}, ${student.neighborhood} - ${student.city}/${student.state} - ${student.zipCode}`, 25, yPos)
            yPos += 4
            doc.text(`   Mãe: ${student.motherName}${student.fatherName ? ' | Pai: ' + student.fatherName : ''}`, 25, yPos)
            yPos += 4
            
            // All course enrollments
            if (student.enrollments && student.enrollments.length > 0) {
              doc.text(`   Cursos (${student.enrollments.length}):`, 25, yPos)
              yPos += 4
              
              student.enrollments.forEach((enrollment) => {
                doc.text(`     • ${enrollment.course?.name || 'Não informado'}`, 30, yPos)
                yPos += 3
                
                const weekdayLabels = {
                  'MONDAY': 'Seg', 'TUESDAY': 'Ter', 'WEDNESDAY': 'Qua',
                  'THURSDAY': 'Qui', 'FRIDAY': 'Sex', 'SATURDAY': 'Sáb', 'SUNDAY': 'Dom'
                }
                const days = enrollment.weekdays?.map(day => weekdayLabels[day as keyof typeof weekdayLabels] || day).join(', ') || 'Não informado'
                const status = enrollment.status === 'ACTIVE' ? 'Ativa' : enrollment.status === 'INACTIVE' ? 'Inativa' : 'Cancelada'
                doc.text(`       ${days} | ${enrollment.schedule || 'Sem horário'} | Status: ${status}`, 30, yPos)
                yPos += 3
                doc.text(`       Matriculado em: ${new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}`, 30, yPos)
                yPos += 3
              })
            } else {
              doc.text(`   Sem matrículas em cursos`, 25, yPos)
              yPos += 4
            }
            
            // Additional info
            doc.text(`   Status: ${student.status === 'ACTIVE' ? 'Ativo' : student.status === 'INACTIVE' ? 'Inativo' : 'Cancelado'}`, 25, yPos)
            yPos += 4
            doc.text(`   Direito de imagem: ${student.imageRights ? 'Autorizado' : 'Não autorizado'}`, 25, yPos)
            yPos += 4
            doc.text(`   Alergias: ${student.hasAllergies ? (student.allergyDescription || 'Sim (não especificada)') : 'Não'}`, 25, yPos)
            yPos += 4
            doc.text(`   Cadastrado em: ${new Date(student.createdAt).toLocaleDateString('pt-BR')}`, 25, yPos)
            yPos += 8
          })
        }
        
        pdfBuffer = Buffer.from(doc.output('arraybuffer'))
        break
      }

      default:
        return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 })
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=relatorio-${reportType}-${Date.now()}.pdf`,
      },
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Falha ao gerar relatório' }, { status: 500 })
  }
}