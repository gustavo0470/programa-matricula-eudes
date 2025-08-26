'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, FileX, Users } from 'lucide-react'
import StudentForm from './StudentForm'
import ConfirmModal from './ConfirmModal'
import Modal from './Modal'
import StudentInfoModal from './StudentInfoModal'
import { translateAndJoinWeekdays } from '../utils/weekdays'

interface Student {
  id: string
  enrollment: string
  name: string
  documentType: string
  documentNumber: string
  phone: string
  email: string
  status: string
  createdAt: string
  updatedAt?: string
  birthDate?: string
  cpf?: string
  fatherName?: string
  motherName: string
  address: string
  neighborhood: string
  zipCode: string
  state: string
  city: string
  imageRights: boolean
  hasAllergies: boolean
  allergyDescription?: string
  enrollments?: any[]
  documents?: any[]
}

interface StudentListProps {
  onAddStudent: () => void
}

export default function StudentList({ onAddStudent }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [ageFilter, setAgeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  })
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [studentInfo, setStudentInfo] = useState<any>(null)
  
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
    } finally {
      setIsLoading(false)
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
  
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModalConfig({ title, message, type })
    setShowModal(true)
  }
  
  const handleDeleteClick = (studentId: string) => {
    setStudentToDelete(studentId)
    setShowDeleteModal(true)
  }

  const handleViewStudent = async (student: Student) => {
    try {
      const response = await fetch(`/api/students/${student.id}`)
      if (response.ok) {
        const fullStudentData = await response.json()
        setStudentInfo(fullStudentData)
        setShowInfoModal(true)
      }
    } catch (error) {
      console.error('Error fetching student details:', error)
    }
  }
  
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return
    
    try {
      const response = await fetch(`/api/students/${studentToDelete}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setStudents(prev => prev.filter(s => s.id !== studentToDelete))
        showAlert('Sucesso', 'Aluno excluído com sucesso!', 'success')
      } else {
        showAlert('Erro', 'Erro ao excluir aluno. Tente novamente.', 'error')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      showAlert('Erro', 'Erro ao excluir aluno. Tente novamente.', 'error')
    } finally {
      setStudentToDelete(null)
    }
  }
  
  const handleStatusChange = async (studentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const updatedStudent = await response.json()
        setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s))
      }
    } catch (error) {
      console.error('Error updating student status:', error)
    }
  }
  
  const handleStudentSaved = () => {
    fetchStudents()
    setEditingStudent(null)
  }
  
  const handleEditStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const fullStudentData = await response.json()
        setEditingStudent(fullStudentData)
      } else {
        showAlert('Erro', 'Erro ao carregar dados do aluno. Tente novamente.', 'error')
      }
    } catch (error) {
      console.error('Error fetching student for edit:', error)
      showAlert('Erro', 'Erro ao carregar dados do aluno. Tente novamente.', 'error')
    }
  }

  const filteredStudents = students.filter(student => {
    // Text search filter
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Course filter
    const matchesCourse = selectedCourse === '' || 
      (student.enrollments && student.enrollments.some((enrollment: any) => 
        enrollment.courseId === selectedCourse && enrollment.status === 'ACTIVE'
      ))
    
    // Year filter (from enrollment)
    const matchesYear = yearFilter === '' || 
      student.enrollment.includes(`/${yearFilter}`)
    
    // Age filter
    let matchesAge = true
    if (ageFilter && student.birthDate) {
      const birthDate = new Date(student.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      switch (ageFilter) {
        case 'under18':
          matchesAge = age < 18
          break
        case '18-25':
          matchesAge = age >= 18 && age <= 25
          break
        case '26-35':
          matchesAge = age >= 26 && age <= 35
          break
        case '36-50':
          matchesAge = age >= 36 && age <= 50
          break
        case 'over50':
          matchesAge = age > 50
          break
      }
    }
    
    // Status filter
    const matchesStatus = statusFilter === '' || student.status === statusFilter
    
    return matchesSearch && matchesCourse && matchesYear && matchesAge && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'INACTIVE':
        return 'Inativo'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Alunos Cadastrados</h2>
          <button
            onClick={onAddStudent}
            className="flex items-center px-4 py-2 bg-emerald-400 text-white rounded-md hover:bg-emerald-500 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="">Todos os cursos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="">Todos os anos</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            
            <div>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="">Todas as idades</option>
                <option value="under18">Menor de 18</option>
                <option value="18-25">18-25 anos</option>
                <option value="26-35">26-35 anos</option>
                <option value="36-50">36-50 anos</option>
                <option value="over50">Acima de 50</option>
              </select>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="">Todos os status</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
            
          {(searchTerm || selectedCourse || yearFilter || ageFilter || statusFilter) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCourse('')
                  setYearFilter('')
                  setAgeFilter('')
                  setStatusFilter('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
          
          {(searchTerm || selectedCourse) && (
            <div className="text-sm text-gray-600">
              Exibindo {filteredStudents.length} de {students.length} alunos
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4 p-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-gray-50 rounded-lg p-4 card hover-lift">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.enrollment}</p>
                  <p className="text-xs text-gray-500">
                    Cadastrado em {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                  {getStatusText(student.status)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Documento:</span>
                  <span className="ml-2 text-gray-900">{student.documentType}: {student.documentNumber}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Contato:</span>
                  <span className="ml-2 text-gray-900 font-mono text-sm">{student.phone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900 text-sm break-all">{student.email}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleViewStudent(student)}
                  className="text-blue-600 hover:text-blue-900 hover-scale transition-transform"
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditStudent(student.id)}
                  className="text-green-600 hover:text-green-900 hover-scale transition-transform"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(student.id)}
                  className="text-red-600 hover:text-red-900 hover-scale transition-transform"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleStatusChange(student.id, student.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE')}
                  className="text-orange-600 hover:text-orange-900 hover-scale transition-transform"
                  title={student.status === 'ACTIVE' ? 'Cancelar matrícula' : 'Reativar matrícula'}
                >
                  <FileX className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <table className="hidden md:table min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aluno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matrícula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Cadastrado em {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.enrollment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {student.documentType}: {student.documentNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{student.phone}</div>
                  <div className="text-sm text-gray-500 break-all">{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                    {getStatusText(student.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditStudent(student.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(student.id)}
                      className="text-red-600 hover:text-red-900 hover-scale transition-transform"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, student.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE')}
                      className="text-orange-600 hover:text-orange-900"
                      title={student.status === 'ACTIVE' ? 'Cancelar matrícula' : 'Reativar matrícula'}
                    >
                      <FileX className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado ainda.'}
          </p>
        </div>
      ) : null}
      
      {/* Mobile empty state handled in mobile cards section */}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-primary-600" />
                  Detalhes Completos do Aluno
                </h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Matrícula</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono bg-primary-100 px-2 py-1 rounded">{selectedStudent.enrollment}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.documentType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número do Documento</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.documentNumber}</p>
                  </div>
                  {selectedStudent.cpf && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CPF</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.cpf}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStudent.birthDate ? new Date(selectedStudent.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Mãe</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.motherName}</p>
                  </div>
                  {selectedStudent.fatherName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome do Pai</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.fatherName}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStudent.status)}`}>
                      {getStatusText(selectedStudent.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.neighborhood}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.state}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-900 font-mono">{selectedStudent.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-900 break-all">{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Direito de Imagem</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedStudent.imageRights ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStudent.imageRights ? 'Assinado' : 'Não assinado'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Possui Alergias</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedStudent.hasAllergies ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedStudent.hasAllergies ? 'Sim' : 'Não'}
                      </span>
                    </p>
                  </div>
                  {selectedStudent.hasAllergies && selectedStudent.allergyDescription && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Descrição da Alergia</label>
                      <p className="mt-1 text-sm text-gray-900 bg-orange-100 p-2 rounded">{selectedStudent.allergyDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enrollments */}
              {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Matrículas</h4>
                  <div className="space-y-3">
                    {selectedStudent.enrollments.map((enrollment: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Curso</label>
                            <p className="text-sm font-medium text-gray-900">{enrollment.course?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Dias</label>
                            <p className="text-sm text-gray-900">{enrollment.weekdays ? translateAndJoinWeekdays(enrollment.weekdays) : 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Horário</label>
                            <p className="text-sm text-gray-900">{enrollment.schedule || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {enrollment.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Documentos Enviados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedStudent.documents.map((doc: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                            <p className="text-xs text-gray-600">{doc.documentType}</p>
                            <p className="text-xs text-gray-500">
                              Enviado em: {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 text-xs"
                          >
                            Ver arquivo
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStudent.updatedAt ? new Date(selectedStudent.updatedAt).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto mobile-full">
            <StudentForm
              student={editingStudent}
              onClose={() => setEditingStudent(null)}
              onSave={handleStudentSaved}
            />
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
      
      {/* General Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

      {/* Student Info Modal */}
      <StudentInfoModal
        isOpen={showInfoModal}
        onClose={() => {
          setShowInfoModal(false)
          setStudentInfo(null)
        }}
        student={studentInfo}
      />
    </div>
  )
}