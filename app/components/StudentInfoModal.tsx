'use client'

import { useState, useEffect } from 'react'
import { X, Download, Calendar, MapPin, Phone, Mail, FileText, User, GraduationCap } from 'lucide-react'
import { translateAndJoinWeekdays } from '../utils/weekdays'

interface StudentInfoModalProps {
  isOpen: boolean
  onClose: () => void
  student: any
}

export default function StudentInfoModal({ isOpen, onClose, student }: StudentInfoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  if (!isOpen || !student) return null

  const handleDocumentDownload = (document: any) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }

  const age = student.birthDate ? Math.floor((Date.now() - new Date(student.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-xl shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{student.name}</h3>
                  <p className="text-blue-100">Matrícula: {student.enrollment}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Informações Pessoais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Tipo de Documento:</span>
                      <p className="text-gray-600 mt-1">
                        {student.documentType === 'RG' ? 'RG' : 
                         student.documentType === 'CIN' ? 'CIN (CPF)' : 
                         'Certidão de Nascimento'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Número:</span>
                      <p className="text-gray-600 mt-1 font-mono">{student.documentNumber}</p>
                    </div>
                    {student.cpf && (
                      <div>
                        <span className="font-medium text-gray-700">CPF:</span>
                        <p className="text-gray-600 mt-1 font-mono">{student.cpf}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Data de Nascimento:</span>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{new Date(student.birthDate).toLocaleDateString()} ({age} anos)</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Nome do Pai:</span>
                      <p className="text-gray-600 mt-1">{student.fatherName || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Nome da Mãe:</span>
                      <p className="text-gray-600 mt-1">{student.motherName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Contato e Endereço
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Endereço Completo:</span>
                      <div className="flex items-start text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{student.address}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {student.neighborhood}, {student.city} - {student.state}
                          </p>
                          <p className="text-xs text-gray-500">CEP: {student.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <span className="font-medium text-gray-700">Telefone:</span>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-mono text-sm">{student.phone}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">E-mail:</span>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm break-all">{student.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courses */}
              {student.enrollments && student.enrollments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                    Cursos Matriculados
                  </h4>
                  <div className="space-y-4">
                    {student.enrollments.map((enrollment: any, index: number) => (
                      <div key={enrollment.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 text-lg">{enrollment.course.name}</h5>
                            <p className="text-sm text-gray-500">Matrícula realizada em {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {enrollment.weekdays && enrollment.weekdays.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Dias da Semana:</span>
                              <p className="text-gray-600 mt-1">{translateAndJoinWeekdays(enrollment.weekdays)}</p>
                            </div>
                          )}
                          {enrollment.schedule && (
                            <div>
                              <span className="font-medium text-gray-700">Horário:</span>
                              <p className="text-gray-600 mt-1">{enrollment.schedule}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Informações Adicionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Direito de Imagem:</span>
                    <p className="text-gray-600">{student.imageRights ? 'Autorizado' : 'Não autorizado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Possui Alergias:</span>
                    <p className="text-gray-600">{student.hasAllergies ? 'Sim' : 'Não'}</p>
                  </div>
                  {student.hasAllergies && student.allergyDescription && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Descrição das Alergias:</span>
                      <p className="text-gray-600">{student.allergyDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {student.documents && student.documents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Documentos Anexados
                  </h4>
                  <div className="space-y-2">
                    {student.documents.map((document: any) => (
                      <div key={document.id} className="bg-white p-3 rounded border flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{document.filename}</p>
                          <p className="text-xs text-gray-500">
                            {document.documentType.replace('_', ' ')} • 
                            {document.isSubmitted ? ' Entregue' : ' Pendente'} • 
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {document.fileUrl && (
                          <button
                            onClick={() => handleDocumentDownload(document)}
                            className="ml-3 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                            title="Baixar documento"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}