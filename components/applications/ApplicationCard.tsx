'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import CreateLeaseModal from '@/components/leases/CreateLeaseModal'
import ContactButton from '@/components/messages/ContactButton'

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
  const [showCancelModal, setShowCancelModal] = useState(false)
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

  const handleCancel = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Candidature annulée')
      setShowCancelModal(false)
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
        <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow bg-white">
          {/* Header avec avatar et infos */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-rose-400 to-orange-300 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-semibold shrink-0">
              {application.tenant.firstName[0]}
              {application.tenant.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900">
                  {application.tenant.firstName} {application.tenant.lastName}
                </h3>
                {getStatusBadge(application.status)}
                {hasDocuments && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    <span>📄</span>
                    <span>
                      {documentCount} doc{documentCount > 1 ? 's' : ''}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {application.tenant.email}
              </p>
            </div>
          </div>

          {/* Infos propriété */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
            <span>🏠</span>
            <span className="font-medium">{application.property.title}</span>
            <span className="text-gray-300">•</span>
            <span>{formatPrice(application.property.rent)}/mois</span>
          </div>

          {/* Message */}
          {application.message && (
            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <p className="text-sm text-gray-600 italic">
                &quot;{application.message}&quot;
              </p>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-gray-400 mb-4">
            Reçue le {formatDate(application.createdAt)}
          </p>

          {/* Actions - TOUJOURS EN COLONNE */}
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
            {/* Bouton profil - toujours visible */}
            <Link
              href={`/profile/${application.tenant.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm w-full"
            >
              <span>👤</span>
              <span>Voir le profil</span>
            </Link>

            {/* 🆕 Bouton Contacter */}
            <ContactButton
              recipientId={application.tenant.id}
              recipientName={application.tenant.firstName}
              propertyId={application.property.id}
            />

            {/* Boutons accepter/refuser */}
            {application.status === 'PENDING' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction('ACCEPTED')}
                  disabled={loading}
                  className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors text-sm"
                >
                  ✓ Accepter
                </button>
                <button
                  onClick={() => handleAction('REJECTED')}
                  disabled={loading}
                  className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:bg-gray-100 transition-colors text-sm"
                >
                  ✗ Refuser
                </button>
              </div>
            )}

            {/* Bouton créer bail */}
            {application.status === 'ACCEPTED' && (
              <button
                onClick={() => setShowLeaseModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-sm w-full"
              >
                <span>📄</span>
                <span>Préparer le bail</span>
              </button>
            )}
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
    <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow bg-white">
      {/* Header avec image et infos */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
        </div>
      </div>

      {/* Propriétaire */}
      {application.property.owner && (
        <div className="flex items-center gap-2 mb-3">
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

      {/* Date */}
      <p className="text-xs text-gray-400 mb-4">
        Candidature envoyée le {formatDate(application.createdAt)}
      </p>

      {/* Actions */}
      <div className="pt-3 border-t border-gray-100">
        {application.status === 'ACCEPTED' && (
          <Link
            href={`/properties/${application.property.id}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-sm"
          >
            Voir les détails
          </Link>
        )}

        {application.status === 'PENDING' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl text-sm">
              <span>⏳</span>
              <span>En attente de réponse</span>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 disabled:bg-gray-100 transition-colors text-sm"
            >
              ✗ Annuler ma candidature
            </button>
          </div>
        )}

        {application.status === 'REJECTED' && (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm">
            Candidature non retenue
          </div>
        )}
      </div>
      {/* Modal confirmation annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Annuler cette candidature ?
              </h3>
              <p className="text-gray-600">
                Vous devrez attendre <strong>7 jours</strong> avant de pouvoir
                repostuler à cette annonce.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Garder
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:bg-gray-300 transition-colors"
              >
                {loading ? '⏳ Annulation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
