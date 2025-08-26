'use client'

import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  autoClose?: boolean
  autoCloseTime?: number
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  autoClose = false,
  autoCloseTime = 3000
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseTime)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseTime, onClose])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          icon: <CheckCircle className="h-8 w-8" />
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          icon: <XCircle className="h-8 w-8" />
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          icon: <AlertCircle className="h-8 w-8" />
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          icon: <Info className="h-8 w-8" />
        }
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
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
          <div>
            {/* Icon */}
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${styles.bg} border-2`}>
              <div className={styles.iconColor}>
                {styles.icon}
              </div>
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg leading-6 font-semibold mx-auto ${styles.titleColor}`}>
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
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-all"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
