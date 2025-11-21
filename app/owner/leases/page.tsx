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
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Actif
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            En attente
          </span>
        )
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Terminé
          </span>
        )
      default:
        return null
    }
  }

  const LeaseCard = ({ lease }: { lease: (typeof leases)[0] }) => (
    <Link
      href={`/owner/leases/${lease.id}`}
      className="block border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
            {lease.tenant.firstName[0]}
            {lease.tenant.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900">
                {lease.tenant.firstName} {lease.tenant.lastName}
              </h3>
              {getStatusBadge(lease.status)}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {lease.property.title} • {lease.property.city}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📅 Début : {formatDate(lease.startDate)}</span>
              {lease.endDate && (
                <span>→ Fin : {formatDate(lease.endDate)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold text-gray-900">
            {formatPrice(lease.monthlyRent)}
          </p>
          <p className="text-sm text-gray-500">/mois</p>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
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
            Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">Mes baux</h1>
          <p className="text-gray-500 mt-1">
            {activeLeases.length} en cours • {endedLeases.length} terminé
            {endedLeases.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-emerald-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-emerald-600">
              {activeLeases.filter(l => l.status === 'ACTIVE').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Actifs</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-orange-600">
              {activeLeases.filter(l => l.status === 'PENDING').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">En attente</p>
          </div>
        </div>

        {/* Aucun bail */}
        {leases.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📄</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun bail
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Acceptez une candidature pour créer votre premier bail.
            </p>
            <Link
              href="/owner/applications"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Voir les candidatures
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Baux en cours */}
            {activeLeases.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span>✅</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Baux en cours
                  </h2>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {activeLeases.length}
                  </span>
                </div>
                <div className="space-y-4">
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
                {endedLeases.map(lease => (
                  <LeaseCard key={lease.id} lease={lease} />
                ))}
              </Accordion>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
