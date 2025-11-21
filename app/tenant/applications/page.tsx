import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ApplicationCard from '@/components/applications/ApplicationCard'

export default async function TenantApplicationsPage() {
  const session = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isTenant: true },
  })

  if (!user?.isTenant) {
    redirect('/profile/complete?required=tenant')
  }

const applications = await prisma.application.findMany({
  where: {
    tenantId: session.user.id,
    // Exclure les candidatures qui ont un bail ACTIF ou PENDING
    NOT: {
      property: {
        leases: {
          some: {
            tenantId: session.user.id,
            status: { in: ['ACTIVE', 'PENDING'] }
          }
        }
      }
    }
  },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          city: true,
          postalCode: true,
          rent: true,
          images: true,
          owner: {
            select: {
              id: true,

              firstName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const pendingCount = applications.filter(a => a.status === 'PENDING').length
  const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            href="/tenant"
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
            Mon espace
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">
            Mes candidatures
          </h1>
          <p className="text-gray-500 mt-1">
            {applications.length} candidature
            {applications.length > 1 ? 's' : ''} envoyée
            {applications.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-orange-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-orange-600">
              {pendingCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">En attente</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-emerald-600">
              {acceptedCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Acceptées</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-gray-400">
              {rejectedCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Refusées</p>
          </div>
        </div>

        {/* Liste */}
        {applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune candidature
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Vous n&apos;avez pas encore postulé à un bien. Attendez de
              recevoir un lien de la part d&apos;un propriétaire.
            </p>
            <Link
              href="/tenant"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Retour à mon espace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                role="tenant"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
