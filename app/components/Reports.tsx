'use client'

import { useState, useEffect } from 'react'
import { Download, Calendar, Users, BookOpen, FileText, Search } from 'lucide-react'
import Modal from './Modal'

type ReportType = 'student' | 'course' | 'period' | 'monthly' | 'yearly'

interface ReportFilters {
  type: ReportType
  studentId?: string
  courseId?: string
  startDate?: string
  endDate?: string
  month?: string
  year?: string
}

export default function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({
    type: 'student',
    year: new Date().getFullYear().toString()
  })
  const [students, setStudents] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  })
  
  useEffect(() => {
    fetchStudents()
    fetchCourses()
  }, [])
  
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }
  
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

  const reportTypes = [
    { value: 'student', label: 'Por Aluno', icon: Users },
    { value: 'course', label: 'Por Curso', icon: BookOpen },
    { value: 'period', label: 'Por Período', icon: Calendar },
    { value: 'monthly', label: 'Mensal', icon: Calendar },
    { value: 'yearly', label: 'Anual', icon: FileText },
  ]


  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModalConfig({ title, message, type })
    setShowModal(true)
  }
  
  const generateReport = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    try {
      let url = ''
      const params = new URLSearchParams()
      
      switch (filters.type) {
        case 'student':
          if (!filters.studentId) {
            showAlert('Campo obrigatório', 'Selecione um aluno para gerar o relatório.', 'warning')
            return
          }
          url = `/api/reports/student`
          params.set('studentId', filters.studentId)
          break
          
        case 'course':
          if (!filters.courseId) {
            showAlert('Campo obrigatório', 'Selecione um curso para gerar o relatório.', 'warning')
            return
          }
          url = `/api/reports/course`
          params.set('courseId', filters.courseId)
          break
          
        case 'period':
          if (!filters.startDate || !filters.endDate) {
            showAlert('Campos obrigatórios', 'Selecione as datas inicial e final para gerar o relatório.', 'warning')
            return
          }
          url = `/api/reports/period`
          params.set('startDate', filters.startDate)
          params.set('endDate', filters.endDate)
          break
          
        case 'monthly':
          if (!filters.month || !filters.year) {
            showAlert('Campos obrigatórios', 'Selecione o mês e ano para gerar o relatório.', 'warning')
            return
          }
          url = `/api/reports/monthly`
          params.set('month', filters.month)
          params.set('year', filters.year)
          break
          
        case 'yearly':
          if (!filters.year) {
            showAlert('Campo obrigatório', 'Selecione o ano para gerar o relatório.', 'warning')
            return
          }
          url = `/api/reports/yearly`
          params.set('year', filters.year)
          break
          
        default:
          showAlert('Erro', 'Tipo de relatório inválido.', 'error')
          return
      }
      
      const response = await fetch(`${url}?${params.toString()}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `relatorio-${filters.type}-${Date.now()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        showAlert('Sucesso!', 'Relatório gerado e baixado com sucesso!', 'success')
      } else {
        showAlert('Erro', 'Erro ao gerar relatório. Tente novamente.', 'error')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      showAlert('Erro', 'Erro ao gerar relatório. Verifique sua conexão e tente novamente.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderFilters = () => {
    switch (filters.type) {
      case 'student':
        const filteredStudents = students.filter(student => 
          student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.enrollment.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.email.toLowerCase().includes(studentSearch.toLowerCase())
        )
        
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Aluno
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Digite o nome, matrícula ou email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            {studentSearch && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Aluno ({filteredStudents.length} encontrados)
                </label>
                <select
                  value={filters.studentId || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um aluno</option>
                  {filteredStudents.slice(0, 10).map(student => (
                    <option key={student.id} value={student.id}>
                      {student.enrollment} - {student.name}
                    </option>
                  ))}
                </select>
                {filteredStudents.length > 10 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Mostrando apenas os primeiros 10 resultados. Refine sua busca para ver mais.
                  </p>
                )}
              </div>
            )}
          </div>
        )

      case 'course':
        const filteredCourses = courses.filter(course => 
          course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
          (course.description && course.description.toLowerCase().includes(courseSearch.toLowerCase()))
        )
        
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Curso
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Digite o nome do curso..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Curso ({filteredCourses.length} encontrados)
              </label>
              <select
                value={filters.courseId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione um curso</option>
                {filteredCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 'period':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )

      case 'monthly':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês
              </label>
              <select
                value={filters.month || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione o mês</option>
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={filters.year || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )

      case 'yearly':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano
            </label>
            <input
              type="number"
              min="2020"
              max="2030"
              value={filters.year || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Relatórios</h2>
        <p className="text-sm text-gray-600 mt-1">
          Gere relatórios em PDF com dados dos alunos, cursos e matrículas
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Relatório
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      setFilters(prev => ({ 
                        ...prev, 
                        type: type.value as ReportType,
                        studentId: undefined,
                        courseId: undefined,
                        startDate: undefined,
                        endDate: undefined,
                        month: undefined
                      }))
                      setStudentSearch('')
                      setCourseSearch('')
                    }}
                    className={`flex items-center p-4 border rounded-lg transition-colors ${
                      filters.type === type.value
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            {renderFilters()}
          </div>

          {/* Generate Report Button */}
          <div className="flex justify-end">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Relatório PDF'}
            </button>
          </div>
        </div>

        {/* Report Preview Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Informações do Relatório</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Todos os relatórios incluem a logomarca e dados da ONG</p>
            <p>• Relatórios por aluno incluem dados pessoais e histórico de matrículas</p>
            <p>• Relatórios por curso mostram lista de alunos matriculados</p>
            <p>• Relatórios por período mostram estatísticas de matrículas</p>
            <p>• Formatos disponíveis: PDF</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total de Alunos</p>
                <p className="text-lg font-semibold text-blue-900">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Cursos Ativos</p>
                <p className="text-lg font-semibold text-green-900">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Matrículas Ativas</p>
                <p className="text-lg font-semibold text-yellow-900">{students.filter(s => s.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
        />
      </div>
    </div>
  )
}