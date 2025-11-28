'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import CreateLeaseModal from '@/components/leases/CreateLeaseModal'

interface Application {
  id: string
  status: string
  message: string | null
  createdAt: Date
  property: {
    id: string
    title: string
    city: string
    rent: number
    postalCode?: string
    images?: string[]
    owner?: {
      id: string
      firstName: string
    }
  }
  tenant?: {
    id: string
    firstName: string
    lastName: string
    email: string
    profileComplete: boolean
    createdAt: Date
    _count?: {
      documents: number
    }
  }
}

interface ApplicationCardProps {
  application: Application
  role: 'owner' | 'tenant'
}

export default function ApplicationCard({
  application,
  role,
}: ApplicationCardProps) {
  const [loading, setLoading] = useState(false)
  const [showLeaseModal, setShowLeaseModal] = useState(false)
  const router = useRouter()

  const handleAction = async (status: 'ACCEPTED' | 'REJECTED') => {
    setLoading(true)

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success(
        status === 'ACCEPTED' ? 'Candidature acceptée !' : 'Candidature refusée'
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            En attente
          </span>
        )
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Acceptée
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Refusée
          </span>
        )
      default:
        return null
    }
  }

  // Vue propriétaire
  if (role === 'owner' && application.tenant) {
    const documentCount = application.tenant._count?.documents || 0
    const hasDocuments = documentCount > 0

    return (
      <>
        <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Infos locataire */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-orange-300 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                {application.tenant.firstName[0]}
                {application.tenant.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900">
                    {application.tenant.firstName} {application.tenant.lastName}
                  </h3>
                  {getStatusBadge(application.status)}
                  {/* 🆕 Badge documents */}
                  {hasDocuments && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      <span>📄</span>
                      <span>{documentCount} doc{documentCount > 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {application.tenant.email}
                </p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-gray-500">
                    Pour :{' '}
                    <span className="font-medium text-gray-700">
                      {application.property.title}
                    </span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    {formatPrice(application.property.rent)}/mois
                  </span>
                </div>
                {application.message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 italic">
                      &quot;{application.message}&quot;
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Reçue le {formatDate(application.createdAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:flex-col flex-shrink-0">
              {/* 🆕 Bouton profil amélioré */}
              <Link
                href={`/profile/${application.tenant.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm min-w-[140px]"
              >
                <span>👤</span>
                <span>Voir le profil</span>
              </Link>

              {application.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleAction('ACCEPTED')}
                    disabled={loading}
                    className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors text-sm min-w-[140px]"
                  >
                    ✓ Accepter
                  </button>
                  <button
                    onClick={() => handleAction('REJECTED')}
                    disabled={loading}
                    className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:bg-gray-100 transition-colors text-sm min-w-[140px]"
                  >
                    ✗ Refuser
                  </button>
                </>
              )}

              {application.status === 'ACCEPTED' && (
                <button
                  onClick={() => setShowLeaseModal(true)}
                  className="px-4 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-sm min-w-[140px]"
                >
                  📄 Créer le bail
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal création bail */}
        {showLeaseModal && application.tenant && (
          <CreateLeaseModal
            applicationId={application.id}
            propertyTitle={application.property.title}
            tenantName={`${application.tenant.firstName} ${application.tenant.lastName}`}
            defaultRent={application.property.rent}
            onClose={() => setShowLeaseModal(false)}
          />
        )}
      </>
    )
  }

  // Vue locataire
  return (
    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-white">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Infos bien */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {application.property.images &&
            application.property.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={application.property.images[0]}
                alt={application.property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🏠</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900">
                {application.property.title}
              </h3>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-sm text-gray-500 mb-1">
              📍 {application.property.city}{' '}
              {application.property.postalCode &&
                `(${application.property.postalCode})`}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(application.property.rent)}
              <span className="text-sm text-gray-400 font-normal">/mois</span>
            </p>
            {application.property.owner && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-gray-500">
                  Proposé par {application.property.owner.firstName}
                </p>
                <Link
                  href={`/profile/${application.property.owner.id}`}
                  className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  Voir le profil →
                </Link>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Candidature envoyée le {formatDate(application.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        {application.status === 'ACCEPTED' && (
          <Link
            href={`/properties/${application.property.id}`}
            className="px-5 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-sm"
          >
            Voir les détails
          </Link>
        )}

        {application.status === 'PENDING' && (
          <div className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm">
            ⏳ En attente de réponse
          </div>
        )}

        {application.status === 'REJECTED' && (
          <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm">
            Candidature non retenue
          </div>
        )}
      </div>
    </div>
  )
}