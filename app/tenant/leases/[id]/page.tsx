import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import LeaseActions from '@/components/leases/LeaseActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenantLeaseDetailPage({ params }: PageProps) {
  const session = await requireAuth()
  const { id } = await params

  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          postalCode: true,
          images: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  })

  if (!lease) {
    notFound()
  }

  if (lease.tenantId !== session.user.id) {
    redirect('/tenant/leases')
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
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Actif
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full font-medium">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            En attente de signature
          </span>
        )
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-full font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Terminé
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/tenant/leases"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            Mes baux
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Titre & Statut */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Mon bail
            </h1>
            <p className="text-gray-500">{lease.property.title}</p>
          </div>
          {getStatusBadge(lease.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Propriété */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Logement
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {lease.property.images && lease.property.images.length > 0 ? (
                    <img
                      src={lease.property.images[0]}
                      alt={lease.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🏠</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {lease.property.title}
                  </p>
                  {lease.status === 'ACTIVE' && (
                    <p className="text-sm text-gray-500 mt-1">
                      {lease.property.address}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {lease.property.city} {lease.property.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Propriétaire */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Propriétaire
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {lease.property.owner.firstName[0]}
                  {lease.property.owner.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {lease.property.owner.firstName}{' '}
                    {lease.property.owner.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lease.property.owner.email}
                  </p>
                  {lease.property.owner.phone && (
                    <p className="text-sm text-gray-500">
                      {lease.property.owner.phone}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/profile/${lease.property.owner.id}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors text-sm"
              >
                👤 Voir le profil complet
              </Link>
            </div>

            {/* Détails du bail */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails du bail
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de début</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(lease.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de fin</p>
                  <p className="font-medium text-gray-900">
                    {lease.endDate ? formatDate(lease.endDate) : 'Non définie'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loyer mensuel</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(lease.monthlyRent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Dépôt de garantie
                  </p>
                  <p className="font-medium text-gray-900">
                    {lease.deposit ? formatPrice(lease.deposit) : 'Non défini'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Statut
              </h2>
              <LeaseActions
                leaseId={lease.id}
                status={lease.status}
                role="tenant"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
