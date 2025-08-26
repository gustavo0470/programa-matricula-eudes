'use client'

import { useState } from 'react'
import { Clock, X } from 'lucide-react'

interface TimePickerProps {
  value: string[]
  onChange: (times: string[]) => void
  placeholder?: string
}

export default function TimePicker({ value, onChange, placeholder = "Selecionar horários" }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedTimes, setSelectedTimes] = useState<string[]>(value || [])

  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ]

  const handleCustomTimeAdd = () => {
    if (startTime && endTime) {
      const timeRange = `${startTime} - ${endTime}`
      const newTimes = [...selectedTimes, timeRange]
      setSelectedTimes(newTimes)
      onChange(newTimes)
      setStartTime('')
      setEndTime('')
    }
  }

  const handlePresetAdd = (preset: string) => {
    if (!selectedTimes.includes(preset)) {
      const newTimes = [...selectedTimes, preset]
      setSelectedTimes(newTimes)
      onChange(newTimes)
    }
  }

  const handleRemoveTime = (timeToRemove: string) => {
    const newTimes = selectedTimes.filter(time => time !== timeToRemove)
    setSelectedTimes(newTimes)
    onChange(newTimes)
  }

  const handleClearAll = () => {
    setSelectedTimes([])
    onChange([])
  }

  const presetTimes = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '19:00 - 21:00',
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-left flex items-center justify-between transition-all"
      >
        <div className="flex-1">
          {selectedTimes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedTimes.slice(0, 2).map((time, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-md"
                >
                  {time}
                </span>
              ))}
              {selectedTimes.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{selectedTimes.length - 2} mais
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <Clock className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg animate-scale-in">
          <div className="p-4">
            {/* Selected Times Display */}
            {selectedTimes.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-700">Horários Selecionados</h5>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Limpar Todos
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTimes.map((time, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-md"
                    >
                      {time}
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(time)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preset Times */}
            <h4 className="text-sm font-medium text-gray-900 mb-3">Horários Predefinidos</h4>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {presetTimes.map((preset) => {
                const isSelected = selectedTimes.includes(preset)
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetAdd(preset)}
                    disabled={isSelected}
                    className={`text-left px-3 py-2 text-sm rounded-md transition-all ${
                      isSelected 
                        ? 'bg-primary-100 text-primary-800 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100 hover-lift'
                    }`}
                  >
                    {preset} {isSelected && '✓'}
                  </button>
                )
              })}
            </div>

            {/* Custom Time */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Adicionar Horário Personalizado</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Início
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                  >
                    <option value="">Selecionar</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fim
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                  >
                    <option value="">Selecionar</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setStartTime('')
                    setEndTime('')
                    setIsOpen(false)
                  }}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleCustomTimeAdd}
                  disabled={!startTime || !endTime}
                  className="px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}