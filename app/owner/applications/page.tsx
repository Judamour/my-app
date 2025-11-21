import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ApplicationCard from '@/components/applications/ApplicationCard'

export default async function OwnerApplicationsPage() {
  const session = await requireOwner()

const allApplications = await prisma.application.findMany({
  where: {
    property: { ownerId: session.user.id },
  },
  include: {
    property: {
      select: {
        id: true,
        title: true,
        city: true,
        rent: true,
        leases: {
          select: {
            tenantId: true,
            status : true
          }
        }
      }
    },
    tenant: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileComplete: true,
        createdAt: true,
      }
    }
  },
  orderBy: { createdAt: 'desc' }
})
// Filtrer : exclure les candidatures ACCEPTED qui ont un bail ACTIF ou PENDING
const applications = allApplications.filter(app => {
  // Si pas acceptée, on garde
  if (app.status !== 'ACCEPTED') return true
  
  // Si acceptée, vérifier qu'un bail ACTIF ou PENDING existe
  const hasActiveLease = app.property.leases.some(
    lease => lease.tenantId === app.tenantId && lease.status !== 'ENDED'
  )
  
  // Garder si pas de bail actif (permet de recréer un bail après fin)
  return !hasActiveLease
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
            href="/owner"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">
            Candidatures reçues
          </h1>
          <p className="text-gray-500 mt-1">
            {applications.length} candidature{applications.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-orange-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-orange-600">{pendingCount}</p>
            <p className="text-sm text-gray-600 mt-1">En attente</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-emerald-600">{acceptedCount}</p>
            <p className="text-sm text-gray-600 mt-1">Acceptées</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-semibold text-gray-400">{rejectedCount}</p>
            <p className="text-sm text-gray-600 mt-1">Refusées</p>
          </div>
        </div>

        {/* Liste */}
        {applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune candidature
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Partagez le lien de vos biens pour recevoir des candidatures de locataires.
            </p>
            <Link
              href="/owner/properties"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Voir mes biens
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                role="owner"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}