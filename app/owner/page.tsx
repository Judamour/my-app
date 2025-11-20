import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function OwnerDashboardPage() {
  const session = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileComplete: true,
      isOwner: true,
      isTenant: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  if (!user.isOwner) {
    redirect('/profile/complete?required=owner')
  }

  const propertiesCount = await prisma.property.count({
    where: { ownerId: user.id },
  })

  const availableCount = await prisma.property.count({
    where: {
      ownerId: user.id,
      available: true,
    },
  })

  const applicationsCount = await prisma.application.count({
    where: {
      property: { ownerId: user.id },
      status: 'PENDING',
    },
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header épuré style Airbnb */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm mb-1">Bienvenue</p>
              <h1 className="text-3xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
            </div>

            {/* Switch vers locataire */}
            {user.isTenant && (
              <Link
                href="/tenant"
                className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <span className="text-xl">🔑</span>
                <span className="font-medium text-gray-700">Mode locataire</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Alerte profil incomplet - Style Airbnb */}
        {!user.profileComplete && (
          <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Complétez votre profil propriétaire
                </h3>
                <p className="text-gray-600 mt-1">
                  Un profil complet inspire confiance aux locataires
                </p>
              </div>
              <Link
                href="/profile/complete"
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Compléter
              </Link>
            </div>
          </div>
        )}

        {/* Stats - Style Airbnb cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/owner/properties"
            className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🏠</span>
              <span className="text-3xl font-semibold text-gray-900">{propertiesCount}</span>
            </div>
            <p className="font-medium text-gray-900">Mes biens</p>
            <p className="text-sm text-gray-500 mt-1">Total propriétés</p>
          </Link>

          <div className="bg-emerald-50 rounded-2xl p-6 hover:bg-emerald-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">✅</span>
              <span className="text-3xl font-semibold text-emerald-600">{availableCount}</span>
            </div>
            <p className="font-medium text-gray-900">Disponibles</p>
            <p className="text-sm text-gray-500 mt-1">Prêts à louer</p>
          </div>

          <Link 
            href="/owner/applications"
            className="bg-orange-50 rounded-2xl p-6 hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📬</span>
              <span className="text-3xl font-semibold text-orange-600">{applicationsCount}</span>
            </div>
            <p className="font-medium text-gray-900">Candidatures</p>
            <p className="text-sm text-gray-500 mt-1">En attente de réponse</p>
          </Link>
        </div>

        {/* Actions principales */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Actions rapides
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ajouter un bien */}
            <Link
              href="/owner/properties/new"
              className="group flex items-center gap-5 p-6 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all duration-200"
            >
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl">➕</span>
              </div>
              <div>
                <p className="font-semibold text-white text-lg">Ajouter un bien</p>
                <p className="text-gray-300 mt-1">Créer une nouvelle fiche</p>
              </div>
            </Link>

            {/* Voir mes biens */}
            <Link
              href="/owner/properties"
              className="group flex items-center gap-5 p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">Mes propriétés</p>
                <p className="text-gray-500 mt-1">Gérer mes biens</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Sections en grille */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dernières candidatures */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Candidatures récentes
              </h2>
              <Link
                href="/owner/applications"
                className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Tout voir →
              </Link>
            </div>
            
            {applicationsCount === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📭</span>
                </div>
                <p className="font-medium text-gray-900">Aucune candidature</p>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  Partagez le lien de votre bien pour recevoir des candidatures
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 rounded-2xl p-6">
                <p className="font-medium text-gray-900">
                  {applicationsCount} candidature{applicationsCount > 1 ? 's' : ''} en attente
                </p>
                <Link
                  href="/owner/applications"
                  className="inline-flex items-center gap-2 mt-4 text-orange-600 font-medium hover:text-orange-700"
                >
                  Voir les candidatures
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Partager mes biens */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Partager un bien
              </h2>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Lien de partage</p>
                  <p className="text-sm text-gray-500">
                    Envoyez un lien unique à un locataire
                  </p>
                </div>
              </div>

              <Link
                href="/owner/properties"
                className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Choisir un bien à partager
              </Link>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                Le locataire recevra un lien pour voir votre bien et postuler
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}