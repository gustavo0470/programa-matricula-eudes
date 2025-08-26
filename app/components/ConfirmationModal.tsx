'use client'

import { X, AlertTriangle, Trash2, Edit, Info } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info' | 'success'
  icon?: 'warning' | 'delete' | 'edit' | 'info'
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  icon = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50 border-red-200',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          iconColor: 'text-red-500'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          iconColor: 'text-yellow-500'
        }
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          iconColor: 'text-blue-500'
        }
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          iconColor: 'text-green-500'
        }
      default:
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          iconColor: 'text-yellow-500'
        }
    }
  }

  const getIcon = () => {
    switch (icon) {
      case 'delete':
        return <Trash2 className="h-8 w-8" />
      case 'edit':
        return <Edit className="h-8 w-8" />
      case 'info':
        return <Info className="h-8 w-8" />
      case 'warning':
      default:
        return <AlertTriangle className="h-8 w-8" />
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            {/* Icon */}
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${styles.bg} border-2 ${styles.bg.replace('bg-', 'border-')}`}>
              <div className={styles.iconColor}>
                {getIcon()}
              </div>
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-semibold text-gray-900 mx-auto">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-600 whitespace-pre-line text-left">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${styles.button}`}
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-all"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
