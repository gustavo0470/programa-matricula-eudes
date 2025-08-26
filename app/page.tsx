'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, BookOpen, FileText, Search, Settings, UserPlus, GraduationCap, BarChart3, Zap } from 'lucide-react'
import Header from './components/Header'
import StudentForm from './components/StudentForm'
import StudentList from './components/StudentList'
import CourseManager from './components/CourseManager'
import Reports from './components/Reports'

type ActiveTab = 'dashboard' | 'students' | 'courses' | 'reports'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [showStudentForm, setShowStudentForm] = useState(false)
  
  // Reset showStudentForm when tab changes
  useEffect(() => {
    if (activeTab !== 'students') {
      setShowStudentForm(false)
    }
  }, [activeTab])
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    pendingDocuments: 0
  })
  
  useEffect(() => {
    fetchDashboardStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const fetchDashboardStats = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/courses')
      ])
      
      if (studentsRes.ok && coursesRes.ok) {
        const students = await studentsRes.json()
        const courses = await coursesRes.json()
        
        const activeStudents = students.filter((s: any) => s.status === 'ACTIVE')
        const activeEnrollments = students.reduce((acc: number, student: any) => {
          return acc + (student.enrollments?.filter((e: any) => e.status === 'ACTIVE').length || 0)
        }, 0)
        
        setDashboardStats({
          totalStudents: students.length,
          totalCourses: courses.length,
          activeEnrollments,
          pendingDocuments: 0 // Will calculate based on missing documents
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white rounded-lg shadow p-6 hover-lift hover-glow transition-all animate-slide-in-up card" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg animate-pulse-subtle">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                    <p className="text-2xl font-semibold text-gray-900 gradient-text">{dashboardStats.totalStudents}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover-lift hover-glow transition-all animate-slide-in-up card" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg animate-pulse-subtle">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cursos Ativos</p>
                    <p className="text-2xl font-semibold text-gray-900 gradient-text">{dashboardStats.totalCourses}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover-lift hover-glow transition-all animate-slide-in-up card" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg animate-pulse-subtle">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Matrículas Ativas</p>
                    <p className="text-2xl font-semibold text-gray-900 gradient-text">{dashboardStats.activeEnrollments}</p>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 card animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center animate-bounce-in">
                <Zap className="h-5 w-5 mr-2 text-yellow-500 animate-pulse-subtle" />
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                <button
                  onClick={() => {
                    setShowStudentForm(true)
                    setActiveTab('students')
                  }}
                  className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover-lift hover-glow animate-fade-in" style={{ animationDelay: '0.5s' }}
                >
                  <UserPlus className="h-8 w-8 text-blue-600 mr-3 hover-scale transition-transform" />
                  <div className="text-left">
                    <p className="font-medium text-blue-900">Novo Aluno</p>
                    <p className="text-sm text-blue-700">Cadastrar aluno</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('courses')}
                  className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all hover-lift hover-glow animate-fade-in" style={{ animationDelay: '0.6s' }}
                >
                  <GraduationCap className="h-8 w-8 text-green-600 mr-3 hover-scale transition-transform" />
                  <div className="text-left">
                    <p className="font-medium text-green-900">Gerenciar Cursos</p>
                    <p className="text-sm text-green-700">Ver e editar cursos</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('students')}
                  className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover-lift hover-glow animate-fade-in" style={{ animationDelay: '0.7s' }}
                >
                  <Users className="h-8 w-8 text-blue-600 mr-3 hover-scale transition-transform" />
                  <div className="text-left">
                    <p className="font-medium text-blue-900">Lista de Alunos</p>
                    <p className="text-sm text-blue-700">Visualizar todos</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all hover-lift hover-glow animate-fade-in" style={{ animationDelay: '0.8s' }}
                >
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3 hover-scale transition-transform" />
                  <div className="text-left">
                    <p className="font-medium text-purple-900">Relatórios</p>
                    <p className="text-sm text-purple-700">Gerar PDFs</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
      case 'students':
        return showStudentForm ? (
          <StudentForm onClose={() => setShowStudentForm(false)} />
        ) : (
          <StudentList onAddStudent={() => setShowStudentForm(true)} />
        )
      case 'courses':
        return <CourseManager />
      case 'reports':
        return <Reports />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto px-4 py-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab)
                  if (item.id === 'students') {
                    setShowStudentForm(false)
                  }
                }}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-2 mx-1 rounded-lg transition-all duration-300 animate-fade-in ${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <Icon className={`h-5 w-5 mb-1 transition-transform hover-scale ${
                  activeTab === item.id ? 'animate-pulse-subtle' : ''
                }`} />
                <span className="text-xs whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-white shadow-sm min-h-screen animate-slide-in">
          <nav className="mt-8">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab)
                    if (item.id === 'students') {
                      setShowStudentForm(false) // Force close form when accessing students list
                    }
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left transition-all duration-300 hover-lift animate-fade-in ${
                    activeTab === item.id
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700 shadow-md transform scale-105'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-transform hover-scale ${
                    activeTab === item.id ? 'animate-pulse-subtle' : ''
                  }`} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}