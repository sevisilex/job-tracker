import React from 'react'
import { X } from 'lucide-react'
import { JobApplication } from '../types'
import Calendar from './Calendar'

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  applications: JobApplication[]
  onDateClick?: (date: string) => void
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, applications, onDateClick }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-4/5 max-w-4xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-mono font-bold">Kalendarz aplikacji</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <Calendar
          applications={applications}
          onDateClick={(date) => {
            if (onDateClick) {
              onDateClick(date)
              onClose()
            }
          }}
        />
      </div>
    </div>
  )
}

export default CalendarModal
