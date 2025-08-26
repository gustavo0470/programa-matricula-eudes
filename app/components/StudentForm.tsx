'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Calendar, Download, Edit, Trash2, Plus } from 'lucide-react'
import TimePicker from './TimePicker'
import Modal from './Modal'

const studentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  documentType: z.enum(['RG', 'CIN', 'BIRTH_CERTIFICATE']),
  documentNumber: z.string().min(1, 'Número do documento é obrigatório'),
  cpf: z.string().optional(),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  fatherName: z.string().optional(),
  motherName: z.string().min(1, 'Nome da mãe é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  zipCode: z.string().min(1, 'CEP é obrigatório'),
  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  imageRights: z.boolean(),
  hasAllergies: z.boolean(),
  allergyDescription: z.string().nullable().optional(),
}).refine((data) => {
  // If hasAllergies is true, allergyDescription should be provided
  if (data.hasAllergies && (!data.allergyDescription || data.allergyDescription.trim() === '')) {
    return false
  }
  return true
}, {
  message: "Descrição da alergia é obrigatória quando possui alergia",
  path: ["allergyDescription"]
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  onClose: () => void
  student?: any
  onSave?: (student: any) => void
}

const weekdays = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
]

const weekdayTranslations: Record<string, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
}

const timeSlots = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  'Personalizado',
]

export default function StudentForm({ onClose, student, onSave }: StudentFormProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<Array<{
    id?: string
    courseId: string
    weekdays: string[]
    schedule: string[]
    isNew?: boolean
  }>>([])
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [isMinor, setIsMinor] = useState(false)
  const [documentUploads, setDocumentUploads] = useState<Record<string, File | null>>({})
  const [documentCheckboxes, setDocumentCheckboxes] = useState({
    birthCertificateCopy: false,
    guardianDocumentCopy: false,
    addressProofCopy: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      imageRights: false,
      hasAllergies: false,
      ...(student && {
        ...student,
        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
      }),
    },
  })


  const documentType = watch('documentType')
  const hasAllergies = watch('hasAllergies')
  const birthDate = watch('birthDate')
  
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      
      setIsMinor(age < 18)
    }
  }, [birthDate])
  
  useEffect(() => {
    fetchCourses()
    
    // If editing a student, populate the form with existing data
    if (student?.enrollments && student.enrollments.length > 0) {
      const existingEnrollments = student.enrollments.map((enrollment: any) => ({
        id: enrollment.id,
        courseId: enrollment.courseId || '',
        weekdays: enrollment.weekdays || [],
        schedule: enrollment.schedule ? enrollment.schedule.split(', ') : [],
        isNew: false
      }))
      setEnrollments(existingEnrollments)
    }
    
    // If editing a student, populate document checkboxes
    if (student?.documents) {
      const documentMap = {
        birthCertificateCopy: false,
        guardianDocumentCopy: false,
        addressProofCopy: false,
      }
      
      student.documents.forEach((doc: any) => {
        if (doc.documentType === 'BIRTH_CERTIFICATE' && doc.isSubmitted) {
          documentMap.birthCertificateCopy = true
        } else if (doc.documentType === 'GUARDIAN_DOCUMENT' && doc.isSubmitted) {
          documentMap.guardianDocumentCopy = true
        } else if (doc.documentType === 'ADDRESS_PROOF' && doc.isSubmitted) {
          documentMap.addressProofCopy = true
        }
      })
      
      setDocumentCheckboxes(documentMap)
    }
  }, [student])
  
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleDocumentUpload = (documentType: string, file: File | null) => {
    // Just store the file locally - upload will happen on form submit
    setDocumentUploads(prev => ({
      ...prev,
      [documentType]: file
    }))
  }

  const uploadDocuments = async (studentId: string) => {
    const uploadPromises = []
    
    for (const [docType, file] of Object.entries(documentUploads)) {
      if (file && file instanceof File) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentType', docType)
        formData.append('studentId', studentId)
        
        uploadPromises.push(
          fetch('/api/upload', {
            method: 'POST',
            body: formData
          }).then(async (response) => {
            if (response.ok) {
              const result = await response.json()
              return { docType, result, success: true }
            } else {
              return { docType, error: await response.json(), success: false }
            }
          }).catch(error => ({ docType, error, success: false }))
        )
      }
    }
    
    if (uploadPromises.length > 0) {
      const results = await Promise.all(uploadPromises)
      results.forEach((uploadResult) => {
        const { docType, success } = uploadResult
        if (success && 'result' in uploadResult) {
          console.log(`Upload de ${docType} realizado com sucesso:`, uploadResult.result)
        } else if ('error' in uploadResult) {
          console.log(`Falha no upload de ${docType}:`, uploadResult.error)
        }
      })
      return results
    }
    
    return []
  }

  const handleDocumentDownload = (document: any) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    } else {
      setModalConfig({
        title: 'Aviso',
        message: 'Este documento não possui arquivo digital disponível.',
        type: 'warning'
      })
      setShowModal(true)
    }
  }

  const handleDocumentDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return
    
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh the form or update the documents list
        window.location.reload()
      } else {
        setModalConfig({
          title: 'Erro',
          message: 'Erro ao excluir documento. Tente novamente.',
          type: 'error'
        })
        setShowModal(true)
      }
    } catch (error) {
      setModalConfig({
        title: 'Erro',
        message: 'Erro ao excluir documento. Verifique sua conexão.',
        type: 'error'
      })
      setShowModal(true)
    }
  }

  const onSubmit = async (data: StudentFormData) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const studentData = {
        ...data,
        birthDate: new Date(data.birthDate).toISOString()
      }
      
      let response
      if (student) {
        // Update existing student
        response = await fetch(`/api/students/${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData)
        })
      } else {
        // Create new student
        response = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData)
        })
      }
      
      if (!response.ok) {
        let error = { message: 'Erro desconhecido' }
        try {
          error = await response.json()
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          error = { message: `Erro ${response.status}: ${response.statusText}` }
        }
        
        console.error('Error saving student:', error)
        console.error('Response status:', response.status)
        
        setModalConfig({
          title: 'Erro',
          message: `Erro ao salvar aluno: ${(error as any)?.message || (error as any)?.error || 'Verifique os dados e tente novamente.'}`,
          type: 'error'
        })
        setShowModal(true)
        return
      }

      const savedStudent = await response.json()
      
      // Upload documents if any are selected and save to database
      try {
        const uploadResults = await uploadDocuments(savedStudent.id)
        const uploadMap = uploadResults.reduce((acc: any, result: any) => {
          if (result.success) {
            acc[result.docType] = result.result.publicUrl
          }
          return acc
        }, {})
        
        const documentTypes = [
          { type: 'BIRTH_CERTIFICATE', hasPhysical: documentCheckboxes.birthCertificateCopy },
          { type: 'GUARDIAN_DOCUMENT', hasPhysical: documentCheckboxes.guardianDocumentCopy },
          { type: 'ADDRESS_PROOF', hasPhysical: documentCheckboxes.addressProofCopy }
        ]
        
        for (const doc of documentTypes) {
          if (doc.hasPhysical || documentUploads[doc.type]) {
            const uploadedFile = documentUploads[doc.type]
            const fileUrl = uploadMap[doc.type] || null
            
            await fetch('/api/documents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: savedStudent.id,
                documentType: doc.type,
                filename: uploadedFile?.name || 'Cópia física',
                fileUrl: fileUrl,
                fileType: uploadedFile?.type || 'physical',
                isSubmitted: doc.hasPhysical || !!uploadedFile
              })
            }).catch(err => {
              console.log('Documento salvo apenas localmente:', doc.type, err)
            })
          }
        }
      } catch (error) {
        console.log('Erro ao salvar informações dos documentos, mas aluno foi cadastrado com sucesso', error)
      }
      
      // Create or update enrollments
      if (enrollments.length > 0) {
        try {
          for (const enrollment of enrollments) {
            if (enrollment.courseId && enrollment.weekdays.length > 0 && enrollment.schedule.length > 0) {
              const enrollmentData = {
                studentId: savedStudent.id,
                courseId: enrollment.courseId,
                weekdays: enrollment.weekdays,
                schedule: enrollment.schedule.join(', ')
              }

              if (enrollment.id && !enrollment.isNew) {
                // Update existing enrollment
                await fetch(`/api/enrollments/${enrollment.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(enrollmentData)
                })
              } else {
                // Create new enrollment
                await fetch('/api/enrollments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(enrollmentData)
                })
              }
            }
          }
        } catch (error) {
          console.log('Erro ao salvar matrículas, mas aluno foi salvo com sucesso')
        }
      }
      
      if (onSave) {
        onSave(savedStudent)
      }
      onClose()
      
    } catch (error) {
      console.error('Error:', error)
      setModalConfig({
        title: 'Erro',
        message: 'Erro ao salvar aluno. Verifique sua conexão e tente novamente.',
        type: 'error'
      })
      setShowModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addEnrollment = () => {
    setEnrollments(prev => [...prev, {
      courseId: '',
      weekdays: [],
      schedule: [],
      isNew: true
    }])
    setShowAddCourse(true)
  }

  const removeEnrollment = (index: number) => {
    setEnrollments(prev => prev.filter((_, i) => i !== index))
  }

  const updateEnrollment = (index: number, field: string, value: any) => {
    setEnrollments(prev => prev.map((enrollment, i) => 
      i === index ? { ...enrollment, [field]: value } : enrollment
    ))
  }

  const toggleWeekdayForEnrollment = (enrollmentIndex: number, day: string) => {
    const enrollment = enrollments[enrollmentIndex]
    const newWeekdays = enrollment.weekdays.includes(day)
      ? enrollment.weekdays.filter(d => d !== day)
      : [...enrollment.weekdays, day]
    updateEnrollment(enrollmentIndex, 'weekdays', newWeekdays)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {student ? 'Editar Aluno' : 'Cadastro de Aluno'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select
              {...register('documentType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione</option>
              <option value="RG">RG</option>
              <option value="CIN">CIN (CPF)</option>
              <option value="BIRTH_CERTIFICATE">Certidão de Nascimento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do Documento *
            </label>
            <input
              {...register('documentNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {documentType === 'RG' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                {...register('cpf')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Nascimento *
            </label>
            <input
              type="date"
              {...register('birthDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Pai
            </label>
            <input
              {...register('fatherName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.fatherName && (
              <p className="text-red-500 text-sm mt-1">{errors.fatherName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Mãe *
            </label>
            <input
              {...register('motherName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Address Information */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço *
            </label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro *
            </label>
            <input
              {...register('neighborhood')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP *
            </label>
            <input
              {...register('zipCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <input
              {...register('state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              {...register('city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Courses and Schedules */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cursos e Horários</h3>
        
        {/* Existing Enrollments */}
        {enrollments.length > 0 && (
          <div className="space-y-4 mb-6">
            {enrollments.map((enrollment, index) => {
              const course = courses.find(c => c.id === enrollment.courseId)
              return (
                <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-md font-medium text-gray-800">
                      Matrícula {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeEnrollment(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Course Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Curso *
                      </label>
                      <select
                        value={enrollment.courseId}
                        onChange={(e) => updateEnrollment(index, 'courseId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Selecione um curso</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Weekdays */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dias da Semana
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {weekdays.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleWeekdayForEnrollment(index, day.value)}
                            className={`px-2 py-1 text-xs rounded-md border ${
                              enrollment.weekdays.includes(day.value)
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Schedule */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horários
                      </label>
                      <TimePicker
                        value={enrollment.schedule}
                        onChange={(schedule) => updateEnrollment(index, 'schedule', schedule)}
                        placeholder="Selecionar horários"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Add Course Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={addEnrollment}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Curso
          </button>
        </div>

        {/* Additional Information */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h3>
        <div className="space-y-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('imageRights')}
              className="mr-2"
            />
            Direito de imagem assinado?
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('hasAllergies')}
              className="mr-2"
            />
            Possui algum tipo de alergia?
          </label>

          {hasAllergies && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qual alergia? *
              </label>
              <input
                {...register('allergyDescription')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descreva a alergia..."
              />
              {errors.allergyDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.allergyDescription.message}</p>
              )}
            </div>
          )}

        </div>

        {/* Document Upload */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos</h3>
        <div className="space-y-6 mb-6">
          {/* Birth Certificate / Student Document */}
          <div className="border border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Certidão de Nascimento / Documento do Aluno
            </label>
            
            {/* Show existing documents */}
            {student?.documents?.filter((doc: any) => doc.documentType === 'BIRTH_CERTIFICATE').map((doc: any) => (
              <div key={doc.id} className="bg-gray-50 p-3 rounded mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.filename}</p>
                  <p className="text-xs text-gray-600">
                    {doc.isSubmitted ? 'Entregue' : 'Pendente'} - {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {doc.fileUrl && (
                    <button
                      type="button"
                      onClick={() => handleDocumentDownload(doc)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Baixar documento"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDocumentDelete(doc.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Excluir documento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={documentCheckboxes.birthCertificateCopy}
                  onChange={(e) => setDocumentCheckboxes(prev => ({ 
                    ...prev, 
                    birthCertificateCopy: e.target.checked 
                  }))}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Possui cópia física do documento</span>
              </label>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Upload do arquivo (opcional):
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload('BIRTH_CERTIFICATE', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                {documentUploads['BIRTH_CERTIFICATE'] && (
                  <p className="text-xs text-green-600 mt-1">
                    Arquivo selecionado: {documentUploads['BIRTH_CERTIFICATE'].name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Guardian Document - Only for minors */}
          {isMinor && (
            <div className="border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Documento do Responsável (menor de 18 anos)
              </label>
              
              {/* Show existing guardian documents */}
              {student?.documents?.filter((doc: any) => doc.documentType === 'GUARDIAN_DOCUMENT').map((doc: any) => (
                <div key={doc.id} className="bg-gray-50 p-3 rounded mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.filename}</p>
                    <p className="text-xs text-gray-600">
                      {doc.isSubmitted ? 'Entregue' : 'Pendente'} - {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {doc.fileUrl && (
                      <button
                        type="button"
                        onClick={() => handleDocumentDownload(doc)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Baixar documento"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDocumentDelete(doc.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Excluir documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={documentCheckboxes.guardianDocumentCopy}
                    onChange={(e) => setDocumentCheckboxes(prev => ({ 
                      ...prev, 
                      guardianDocumentCopy: e.target.checked 
                    }))}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">Possui cópia física do documento</span>
                </label>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Upload do arquivo (opcional):
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentUpload('GUARDIAN_DOCUMENT', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  {documentUploads['GUARDIAN_DOCUMENT'] && (
                    <p className="text-xs text-green-600 mt-1">
                      Arquivo selecionado: {documentUploads['GUARDIAN_DOCUMENT'].name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Address Proof */}
          <div className="border border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Comprovante de Endereço
            </label>
            
            {/* Show existing address proof documents */}
            {student?.documents?.filter((doc: any) => doc.documentType === 'ADDRESS_PROOF').map((doc: any) => (
              <div key={doc.id} className="bg-gray-50 p-3 rounded mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.filename}</p>
                  <p className="text-xs text-gray-600">
                    {doc.isSubmitted ? 'Entregue' : 'Pendente'} - {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {doc.fileUrl && (
                    <button
                      type="button"
                      onClick={() => handleDocumentDownload(doc)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Baixar documento"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDocumentDelete(doc.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Excluir documento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={documentCheckboxes.addressProofCopy}
                  onChange={(e) => setDocumentCheckboxes(prev => ({ 
                    ...prev, 
                    addressProofCopy: e.target.checked 
                  }))}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Possui cópia física do documento</span>
              </label>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Upload do arquivo (opcional):
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload('ADDRESS_PROOF', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                {documentUploads['ADDRESS_PROOF'] && (
                  <p className="text-xs text-green-600 mt-1">
                    Arquivo selecionado: {documentUploads['ADDRESS_PROOF'].name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Salvando...' : (student ? 'Atualizar Aluno' : 'Cadastrar Aluno')}
          </button>
        </div>
      </form>
      
      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  )
}