'use client'

import { useState } from 'react'

interface ServiceStatusToggleProps {
  service: 'insurance' | 'energy' | 'internet'
  label: string
  icon: string
  confirmed: boolean
  confirmedAt: string | null
  onToggle: (service: string, confirmed: boolean) => Promise<void>
}

export default function ServiceStatusToggle({
  service,
  label,
  icon,
  confirmed,
  confirmedAt,
  onToggle,
}: ServiceStatusToggleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(confirmed)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(service, !isConfirmed)
      setIsConfirmed(!isConfirmed)
    } catch (error) {
      console.error('Error toggling service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
      isConfirmed 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          {isConfirmed && confirmedAt && (
            <p className="text-xs text-green-600">
              ✓ Confirmé le {new Date(confirmedAt).toLocaleDateString('fr-FR')}
            </p>
          )}
          {!isConfirmed && (
            <p className="text-xs text-gray-500">Non souscrit</p>
          )}
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative w-14 h-8 rounded-full transition-all ${
          isConfirmed ? 'bg-green-500' : 'bg-gray-300'
        } ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
            isConfirmed ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}