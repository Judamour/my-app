'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ServicesWidgetProps {
  hasActiveLease: boolean
  propertyTitle?: string
}

interface ServiceStatus {
  confirmed: boolean
  confirmedAt: string | null
}

interface Services {
  insurance: ServiceStatus
  energy: ServiceStatus
  internet: ServiceStatus
}

export default function ServicesWidget({ hasActiveLease, propertyTitle }: ServicesWidgetProps) {
  const [services, setServices] = useState<Services | null>(null)
  const [loading, setLoading] = useState(hasActiveLease)

  useEffect(() => {
    if (hasActiveLease) {
      fetch('/api/tenant/services')
        .then(res => res.json())
        .then(data => {
          if (data.services) {
            setServices(data.services)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [hasActiveLease])

  const completedCount = services
    ? [services.insurance.confirmed, services.energy.confirmed, services.internet.confirmed].filter(Boolean).length
    : 0

  const allCompleted = completedCount === 3

  return (
    <div className={`rounded-xl p-6 ${
      hasActiveLease 
        ? allCompleted
          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
        : 'bg-white border border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          hasActiveLease ? 'bg-white/20' : 'bg-purple-100'
        }`}>
          <span className="text-2xl">{allCompleted ? '✅' : '🏠'}</span>
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${hasActiveLease ? 'text-white' : 'text-gray-900'}`}>
            {allCompleted ? 'Bien installé !' : 'Services essentiels'}
          </h3>
          {hasActiveLease && propertyTitle && (
            <p className={`text-sm ${hasActiveLease ? 'text-white/80' : 'text-gray-500'}`}>
              {propertyTitle}
            </p>
          )}
        </div>
        {hasActiveLease && !loading && (
          <div className="text-right">
            <div className="text-2xl font-bold">{completedCount}/3</div>
          </div>
        )}
      </div>

      {/* Services liste */}
      <div className="space-y-3 mb-4">
        <ServiceItem 
          icon="🛡️" 
          label="Assurance habitation" 
          tag={services?.insurance.confirmed ? 'CONFIRMÉ' : 'OBLIGATOIRE'}
          confirmed={services?.insurance.confirmed || false}
          light={hasActiveLease}
          loading={loading}
        />
        <ServiceItem 
          icon="⚡" 
          label="Électricité & Gaz" 
          tag={services?.energy.confirmed ? 'CONFIRMÉ' : 'RECOMMANDÉ'}
          confirmed={services?.energy.confirmed || false}
          light={hasActiveLease}
          loading={loading}
        />
        <ServiceItem 
          icon="🌐" 
          label="Internet" 
          tag={services?.internet.confirmed ? 'CONFIRMÉ' : 'RECOMMANDÉ'}
          confirmed={services?.internet.confirmed || false}
          light={hasActiveLease}
          loading={loading}
        />
      </div>

      {/* CTA */}
      <Link
        href="/tenant/services"
        className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all ${
          hasActiveLease
            ? 'bg-white text-purple-600 hover:bg-purple-50'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {allCompleted ? 'Voir les détails' : 'Gérer mes services →'}
      </Link>

      {/* Message */}
      {hasActiveLease && !allCompleted && (
        <p className="text-white/80 text-xs text-center mt-3">
          💡 N&apos;oubliez pas votre assurance habitation !
        </p>
      )}
    </div>
  )
}

function ServiceItem({ 
  icon, 
  label, 
  tag, 
  confirmed,
  light,
  loading,
}: { 
  icon: string
  label: string
  tag: string
  confirmed: boolean
  light: boolean
  loading: boolean
}) {
  const getTagStyle = () => {
    if (loading) return light ? 'bg-white/20' : 'bg-gray-200'
    if (confirmed) return 'bg-green-400 text-green-900'
    if (tag === 'OBLIGATOIRE') return light ? 'bg-red-400' : 'bg-red-100 text-red-700'
    return light ? 'bg-yellow-400/80' : 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${
      light ? 'bg-white/10' : 'bg-gray-50'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{confirmed ? '✅' : icon}</span>
        <span className={`font-medium text-sm ${light ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTagStyle()} ${
        light && !confirmed ? 'text-gray-900' : ''
      }`}>
        {loading ? '...' : tag}
      </span>
    </div>
  )
}