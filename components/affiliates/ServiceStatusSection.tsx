'use client'

import { useState } from 'react'
import ServiceStatusToggle from './ServiceStatusToggle'

interface ServiceStatus {
  confirmed: boolean
  confirmedAt: string | null
}

interface ServiceStatusSectionProps {
  propertyTitle: string
  initialServices: {
    insurance: ServiceStatus
    energy: ServiceStatus
    internet: ServiceStatus
  }
}

export default function ServiceStatusSection({
  propertyTitle,
  initialServices,
}: ServiceStatusSectionProps) {
  const [services, setServices] = useState(initialServices)

  const completedCount = [
    services.insurance.confirmed,
    services.energy.confirmed,
    services.internet.confirmed,
  ].filter(Boolean).length

  const handleToggle = async (service: string, confirmed: boolean) => {
    try {
      const response = await fetch('/api/tenant/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, confirmed }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      const data = await response.json()
      setServices(data.services)
    } catch (error) {
      console.error('Error updating service:', error)
      throw error
    }
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-8 text-white">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">
            ✅ Vos services pour {propertyTitle}
          </h2>
          <p className="text-green-100">
            Confirmez les services que vous avez déjà souscrits
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{completedCount}/3</div>
          <div className="text-green-100 text-sm">complétés</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/20 rounded-full mb-6">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / 3) * 100}%` }}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <ServiceStatusToggle
          service="insurance"
          label="J'ai mon assurance habitation"
          icon="🛡️"
          confirmed={services.insurance.confirmed}
          confirmedAt={services.insurance.confirmedAt}
          onToggle={handleToggle}
        />
        <ServiceStatusToggle
          service="energy"
          label="J'ai mon contrat électricité/gaz"
          icon="⚡"
          confirmed={services.energy.confirmed}
          confirmedAt={services.energy.confirmedAt}
          onToggle={handleToggle}
        />
        <ServiceStatusToggle
          service="internet"
          label="J'ai mon abonnement internet"
          icon="🌐"
          confirmed={services.internet.confirmed}
          confirmedAt={services.internet.confirmedAt}
          onToggle={handleToggle}
        />
      </div>

      {/* Message de félicitations */}
      {completedCount === 3 && (
        <div className="mt-4 p-3 bg-white/20 rounded-lg text-center">
          <span className="text-2xl">🎉</span>
          <p className="font-semibold">Félicitations ! Vous êtes bien installé !</p>
        </div>
      )}
    </div>
  )
}