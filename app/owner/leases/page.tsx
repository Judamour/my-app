import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Accordion from '@/components/ui/Accordion'

export default async function OwnerLeasesPage() {
  const session = await requireOwner()

  const leases = await prisma.lease.findMany({
    where: {
      property: {
        ownerId: session.user.id,
      },
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
        },
      },
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: {
          documents: true, // ✅ Compter les documents
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Séparer les baux actifs/pending des baux terminés
  const activeLeases = leases.filter(
    l => l.status === 'ACTIVE' || l.status === 'PENDING'
  )
  const endedLeases = leases.filter(l => l.status === 'ENDED')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
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
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Actif
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-200">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            En attente
          </span>
        )
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Terminé
          </span>
        )
      default:
        return null
    }
  }

  const LeaseCard = ({ lease }: { lease: (typeof leases)[0] }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
              {lease.tenant.firstName[0]}
              {lease.tenant.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900">
                  {lease.tenant.firstName} {lease.tenant.lastName}
                </h3>
                {getStatusBadge(lease.status)}
              </div>
              <p className="text-sm text-gray-600 truncate">
                📍 {lease.property.title} • {lease.property.city}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(lease.monthlyRent)}
            </p>
            <p className="text-xs text-gray-500">/mois</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>Début : <strong>{formatDate(lease.startDate)}</strong></span>
          </div>
          {lease.endDate && (
            <>
              <span className="text-gray-300">→</span>
              <div className="flex items-center gap-2">
                <span>🏁</span>
                <span>Fin : <strong>{formatDate(lease.endDate)}</strong></span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <Link
            href={`/owner/leases/${lease.id}`}
            className="flex-1 text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Voir les détails
          </Link>
          
          {lease._count.documents > 0 && (
            <Link
              href={`/owner/leases/${lease.id}/documents`}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors border border-purple-200 text-sm"
            >
              <span>📄</span>
              <span>{lease._count.documents} doc{lease._count.documents > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour au dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Mes baux</h1>
          <p className="text-gray-600 mt-1">
            {activeLeases.length} en cours • {endedLeases.length} terminé{endedLeases.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <p className="text-3xl font-bold text-emerald-600">
                {activeLeases.filter(l => l.status === 'ACTIVE').length}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-700">Actifs</p>
          </div>
          
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">⏳</span>
              <p className="text-3xl font-bold text-orange-600">
                {activeLeases.filter(l => l.status === 'PENDING').length}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-700">En attente</p>
          </div>
        </div>

        {/* Aucun bail */}
        {leases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📄</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun bail
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Acceptez une candidature pour créer votre premier bail.
            </p>
            <Link
              href="/owner/applications"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              <span>📝</span>
              Voir les candidatures
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Baux en cours */}
            {activeLeases.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Baux en cours
                  </h2>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                    {activeLeases.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {activeLeases.map(lease => (
                    <LeaseCard key={lease.id} lease={lease} />
                  ))}
                </div>
              </div>
            )}

            {/* Baux terminés */}
            {endedLeases.length > 0 && (
              <Accordion
                title="Historique"
                count={endedLeases.length}
                icon="📁"
              >
                <div className="space-y-4">
                  {endedLeases.map(lease => (
                    <LeaseCard key={lease.id} lease={lease} />
                  ))}
                </div>
              </Accordion>
            )}
          </div>
        )}
      </div>
    </div>
  )
}