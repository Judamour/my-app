import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import LeaseActions from '@/components/leases/LeaseActions'
import OwnerDeclarePayment from '@/components/receipts/OwnerDeclarePayment'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeaseDetailPage({ params }: PageProps) {
  const session = await requireOwner()
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
          ownerId: true,
        },
      },
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  if (!lease) {
    notFound()
  }

  if (lease.property.ownerId !== session.user.id) {
    redirect('/owner/leases')
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
            href="/owner/leases"
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
              Bail - {lease.property.title}
            </h1>
            <p className="text-gray-500">
              Créé le {formatDate(lease.createdAt)}
            </p>
          </div>
          {getStatusBadge(lease.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
   {/* Locataire */}
<div className="bg-gray-50 rounded-2xl p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
    Locataire
  </h2>
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-orange-300 rounded-full flex items-center justify-center text-white text-xl font-semibold">
      {lease.tenant.firstName[0]}
      {lease.tenant.lastName[0]}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900">
        {lease.tenant.firstName} {lease.tenant.lastName}
      </p>
      <p className="text-sm text-gray-500">{lease.tenant.email}</p>
      {lease.tenant.phone && (
        <p className="text-sm text-gray-500">
          {lease.tenant.phone}
        </p>
      )}
    </div>
  </div>
  <Link
    href={`/profile/${lease.tenant.id}`}
    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors text-sm"
  >
    👤 Voir le profil complet
  </Link>
</div>

            {/* Propriété */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Propriété
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {lease.property.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lease.property.address}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lease.property.city} {lease.property.postalCode}
                  </p>
                </div>
              </div>
              <Link
                href={`/owner/properties/${lease.property.id}`}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Voir la propriété →
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

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              {lease.status === 'ACTIVE' && (
                <div className="mb-4">
                  <OwnerDeclarePayment
                    leaseId={lease.id}
                    monthlyRent={lease.monthlyRent}
                    charges={lease.charges}
                    startDate={lease.startDate}
                    tenantName={`${lease.tenant.firstName} ${lease.tenant.lastName}`}
                  />
                </div>
              )}
              <LeaseActions
                leaseId={lease.id}
                status={lease.status}
                role="owner"
              />{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
