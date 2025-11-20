import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ShareButton from '@/components/ShareButton'

export default async function TenantDashboardPage() {
  const session = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      isTenant: true,
      isOwner: true,
      profileComplete: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  if (!user.isTenant) {
    redirect('/profile/complete?required=tenant')
  }

  const applicationsCount = await prisma.application.count({
    where: { tenantId: user.id },
  })

  const pendingApplications = await prisma.application.count({
    where: {
      tenantId: user.id,
      status: 'PENDING',
    },
  })

  const activeLeases = await prisma.lease.count({
    where: {
      tenantId: user.id,
      status: 'ACTIVE',
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

            {/* Switch vers proprio */}
            {user.isOwner && (
              <Link
                href="/owner"
                className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <span className="text-xl">🏠</span>
                <span className="font-medium text-gray-700">
                  Mode propriétaire
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Alerte profil incomplet - Style Airbnb */}
        {!user.profileComplete && (
          <div className="mb-10 bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Complétez votre passport de confiance
                </h3>
                <p className="text-gray-600 mt-1">
                  Les propriétaires acceptent 3x plus les profils complets
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
            href="/tenant/applications"
            className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors block"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📝</span>
              <span className="text-3xl font-semibold text-gray-900">
                {applicationsCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Candidatures</p>
            <p className="text-sm text-gray-500 mt-1">Total envoyées</p>
          </Link>

          <div className="bg-orange-50 rounded-2xl p-6 hover:bg-orange-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">⏳</span>
              <span className="text-3xl font-semibold text-orange-600">
                {pendingApplications}
              </span>
            </div>
            <p className="font-medium text-gray-900">En attente</p>
            <p className="text-sm text-gray-500 mt-1">Réponse propriétaire</p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 hover:bg-emerald-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🏡</span>
              <span className="text-3xl font-semibold text-emerald-600">
                {activeLeases}
              </span>
            </div>
            <p className="font-medium text-gray-900">Bail actif</p>
            <p className="text-sm text-gray-500 mt-1">Logement actuel</p>
          </div>
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mes candidatures */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Mes candidatures
              </h2>
              <Link
                href="/tenant/applications"
                className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Tout voir →
              </Link>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <p className="font-medium text-gray-900">Aucune candidature</p>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Vous recevrez un lien de la part d&apos;un propriétaire pour
                découvrir son bien
              </p>
            </div>
          </div>

          {/* Mon passport */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Mon passport
              </h2>
              <Link
                href="/profile"
                className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Modifier →
              </Link>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              {/* Mini profil */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-orange-300 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {user.profileComplete ? (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Profil vérifié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-orange-500">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        À compléter
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bouton partager */}
              <ShareButton type="PROFILE" className="w-full" />

              <p className="text-center text-sm text-gray-500 mt-3">
                Envoyez votre passport à un propriétaire pour postuler
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
