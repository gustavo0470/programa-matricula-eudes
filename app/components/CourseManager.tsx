'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit, Trash2, Users, BookOpen } from 'lucide-react'
import { translateAndJoinWeekdays } from '../utils/weekdays'
import { useOptimizedFetch, useOptimizedMutation } from '../hooks/useOptimizedFetch'
import FastModal from './FastModal'
import ConfirmationModal from './ConfirmationModal'
import NotificationModal from './NotificationModal'

interface Course {
  id: string
  name: string
  description?: string
  studentsCount: number
  createdAt: string
}

export default function CourseManager() {
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseStudents, setCourseStudents] = useState<any[]>([])
  
  // Hooks otimizados
  const { data: courses, loading: isLoading, refetch } = useOptimizedFetch<Course[]>('/api/courses', {
    cacheKey: 'courses-list',
    cacheDuration: 30000 // 30 segundos
  })
  const { mutate, loading: mutationLoading } = useOptimizedMutation()
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'warning' | 'danger' | 'info',
    icon: 'warning' as 'warning' | 'delete' | 'edit' | 'info'
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  })
  
  // Memoized values
  const coursesList = useMemo(() => courses || [], [courses])
  const hasNoCourses = useMemo(() => coursesList.length === 0, [coursesList])
  
  // Helper functions
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ isOpen: true, title, message, type })
  }

  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'warning' | 'danger' | 'info' = 'warning',
    icon: 'warning' | 'delete' | 'edit' | 'info' = 'warning'
  ) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type, icon })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mutationLoading) return
    
    try {
      const courseData = { name: formData.name, description: formData.description }
      
      if (editingCourse) {
        await mutate(`/api/courses/${editingCourse.id}`, {
          method: 'PUT',
          body: JSON.stringify(courseData)
        }, ['courses-list'])
        showNotification('Sucesso', 'Curso atualizado com sucesso!', 'success')
      } else {
        await mutate('/api/courses', {
          method: 'POST',
          body: JSON.stringify(courseData)
        }, ['courses-list'])
        showNotification('Sucesso', 'Curso criado com sucesso!', 'success')
      }

      setFormData({ name: '', description: '' })
      setEditingCourse(null)
      setShowForm(false)
      refetch()
    } catch (error) {
      showNotification('Erro', 'Erro ao salvar curso', 'error')
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({ name: course.name, description: course.description || '' })
    setShowForm(true)
  }

  const handleDelete = async (courseId: string) => {
    const course = coursesList.find(c => c.id === courseId)
    if (!course) return
    
    if (course.studentsCount > 0) {
      const message = `Este curso possui ${course.studentsCount} aluno${course.studentsCount > 1 ? 's' : ''} matriculado${course.studentsCount > 1 ? 's' : ''}.

Para excluir este curso, você precisa primeiro cancelar todas as matrículas dos alunos.

Deseja visualizar os alunos matriculados?`
      
      showConfirmDialog(
        'Curso possui alunos matriculados',
        message,
        () => handleViewStudents(courseId),
        'warning',
        'warning'
      )
      return
    }

    showConfirmDialog(
      'Excluir Curso',
      `Tem certeza que deseja excluir o curso "${course.name}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          await mutate(`/api/courses/${courseId}`, { method: 'DELETE' }, ['courses-list'])
          showNotification('Sucesso', 'Curso excluído com sucesso!', 'success')
          refetch()
        } catch (error) {
          showNotification('Erro', 'Erro ao excluir curso', 'error')
        }
      },
      'danger',
      'delete'
    )
  }

  const handleViewStudents = async (courseId: string) => {
    try {
      const response = await fetch(`/api/reports/course?courseId=${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourseStudents(data.enrollments || [])
        const course = coursesList.find(c => c.id === courseId)
        setSelectedCourse(course || null)
      }
    } catch (error) {
      showNotification('Erro', 'Erro ao carregar alunos do curso', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Cursos</h1>
          <p className="text-gray-600">Gerencie os cursos da instituição</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Curso
        </button>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesList.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Users className="w-3 h-3" />
                      <span>{course.studentsCount} alunos</span>
                    </div>
                  </div>
                </div>
              </div>

              {course.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewStudents(course.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver Alunos
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && hasNoCourses && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso cadastrado</h3>
          <p className="text-gray-500 mb-6">Comece criando seu primeiro curso</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Primeiro Curso
          </button>
        </div>
      )}

      {/* Course Form Modal */}
      <FastModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingCourse(null)
          setFormData({ name: '', description: '' })
        }}
        title={editingCourse ? 'Editar Curso' : 'Novo Curso'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Curso
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome do curso"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a descrição do curso"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingCourse(null)
                setFormData({ name: '', description: '' })
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutationLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutationLoading ? 'Salvando...' : editingCourse ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </FastModal>

      {/* Students Modal */}
      <FastModal
        isOpen={!!selectedCourse}
        onClose={() => {
          setSelectedCourse(null)
          setCourseStudents([])
        }}
        title={`Alunos do Curso: ${selectedCourse?.name}`}
        size="lg"
      >
        {courseStudents.length > 0 ? (
          <div className="space-y-4">
            {courseStudents.map((enrollment) => (
              <div key={enrollment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{enrollment.student.name}</h4>
                    <p className="text-sm text-gray-600">Matrícula: {enrollment.student.enrollment}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {enrollment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Horário: {enrollment.schedule}</p>
                  <p>Dias: {translateAndJoinWeekdays(enrollment.weekdays)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Nenhum aluno matriculado neste curso</p>
        )}
      </FastModal>

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmModal.onConfirm()
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        icon={confirmModal.icon}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}
