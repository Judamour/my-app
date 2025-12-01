import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ApplicationCard from '@/components/applications/ApplicationCard'

export default async function OwnerApplicationsPage() {
  const session = await requireOwner()

const allApplications = await prisma.application.findMany({
  where: {
    property: { ownerId: session.user.id },
    status: { not: 'CANCELLED' },  // Exclure les annulées
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
            status: true
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
        // 🆕 AJOUTER le compteur de documents
        _count: {
          select: {
            documents: {
              where: {
                leaseId: null, // Seulement documents de profil
              },
            },
          },
        },
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Candidatures reçues
          </h1>
          <p className="text-gray-600 mt-1">
            {applications.length} candidature{applications.length > 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">⏳</span>
              <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <p className="text-sm font-medium text-gray-700">En attente</p>
          </div>
          
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <p className="text-3xl font-bold text-emerald-600">{acceptedCount}</p>
            </div>
            <p className="text-sm font-medium text-gray-700">Acceptées</p>
          </div>
          
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">❌</span>
              <p className="text-3xl font-bold text-gray-600">{rejectedCount}</p>
            </div>
            <p className="text-sm font-medium text-gray-700">Refusées</p>
          </div>
        </div>

        {/* Liste */}
        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune candidature
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Partagez le lien de vos biens pour recevoir des candidatures de locataires.
            </p>
            <Link
              href="/owner/properties"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              <span>🏠</span>
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