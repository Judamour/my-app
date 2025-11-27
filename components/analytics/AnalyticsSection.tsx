'use client'

import { useEffect, useState } from 'react'
import RevenueChart from './RevenueChart'
import LoadingWrapper from '@/components/ui/LoadingWrapper'
import { Skeleton } from '@/components/ui/Skeleton'

interface AnalyticsData {
  monthlyRevenues: { month: string; value: number }[]
  occupancyRate: number
  totalProperties: number
  occupiedProperties: number
  recentActivities: Array<{
    id: string
    title: string
    message: string
    createdAt: string
    read: boolean
  }>
}

export default function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/owner/analytics')
      const result = await res.json()
      
      if (res.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('Load analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Skeleton variant="rectangular" height={300} />
        <Skeleton variant="rectangular" height={300} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 mb-12">
      {/* Graphique + Taux d'occupation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique revenus */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            📈 Revenus mensuels
          </h3>
          <RevenueChart data={data.monthlyRevenues} />
        </div>

        {/* Taux d'occupation */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-blue-100 text-sm font-medium">
              Taux d&apos;occupation
            </span>
            <span className="text-2xl">🏠</span>
          </div>
          
          <div className="mb-6">
            <div className="text-5xl font-bold mb-2">
              {data.occupancyRate}%
            </div>
            <p className="text-blue-100 text-sm">
              {data.occupiedProperties}/{data.totalProperties} propriétés louées
            </p>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-blue-400/30 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all"
              style={{ width: `${data.occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dernières activités */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🕐 Activité récente
        </h3>
        
        {data.recentActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
        ) : (
          <div className="space-y-3">
            {data.recentActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  activity.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.read ? 'bg-gray-300' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {activity.title}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {activity.message}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}