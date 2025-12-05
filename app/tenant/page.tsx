import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ShareButton from '@/components/ShareButton'
import ServicesWidget from '@/components/affiliates/ServicesWidget'

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
      phone: true,
      salary: true,
      profession: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  const applicationsCount = await prisma.application.count({
    where: {
      tenantId: user.id,
      NOT: {
        property: {
          leases: {
            some: {
              tenantId: user.id,
            },
          },
        },
      },
    },
  })

  const pendingApplications = await prisma.application.count({
    where: {
      tenantId: user.id,
      status: 'PENDING',
      NOT: {
        property: {
          leases: {
            some: {
              tenantId: user.id,
              status: { in: ['ACTIVE', 'PENDING'] },
            },
          },
        },
      },
    },
  })

  // 🆕 Compter les baux où je suis tenant principal OU colocataire
  const [directLeasesCount, coTenantLeasesCount] = await Promise.all([
    // Baux où je suis le tenant principal
    prisma.lease.count({
      where: {
        tenantId: user.id,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    }),
    // Baux où je suis colocataire (via LeaseTenant)
    prisma.leaseTenant.count({
      where: {
        tenantId: user.id,
        leftAt: null,
        lease: {
          tenantId: { not: user.id }, // Pas déjà compté
          status: { in: ['ACTIVE', 'PENDING'] },
        },
      },
    }),
  ])

  const isProfileIncomplete = !user.phone || !user.salary || !user.profession

  const activeLeases = directLeasesCount + coTenantLeasesCount

  const receiptsCount = await prisma.receipt.count({
    where: {
      lease: { tenantId: user.id },
      status: 'CONFIRMED',
    },
  })

  const pendingPayments = await prisma.receipt.count({
    where: {
      lease: { tenantId: user.id },
      status: 'DECLARED',
    },
  })

  // 🆕 Récupérer le bail actif pour le widget services (incluant colocations)
  let activeLease = await prisma.lease.findFirst({
    where: {
      tenantId: user.id,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      property: {
        select: { title: true },
      },
    },
  })

  // Si pas de bail direct, chercher via colocation
  if (!activeLease) {
    const coTenantLease = await prisma.leaseTenant.findFirst({
      where: {
        tenantId: user.id,
        leftAt: null,
        lease: {
          status: 'ACTIVE',
        },
      },
      select: {
        lease: {
          select: {
            id: true,
            property: {
              select: { title: true },
            },
          },
        },
      },
    })

    if (coTenantLease) {
      activeLease = coTenantLease.lease
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Bienvenue {user.firstName} 👋</p>
        </div>

        {/* Alertes */}
        <div className="space-y-4 mb-8">
          {/* Alerte profil incomplet */}
          {isProfileIncomplete && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    Complétez votre passport de confiance
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Les propriétaires acceptent 3x plus les profils complets
                    (téléphone, salaire, profession)
                  </p>
                </div>
                <Link
                  href="/profile/edit"
                  className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors flex-shrink-0"
                >
                  Compléter
                </Link>
              </div>
            </div>
          )}

          {/* Alerte paiements en attente */}
          {pendingPayments > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {pendingPayments} paiement{pendingPayments > 1 ? 's' : ''}{' '}
                    en attente
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Votre propriétaire doit confirmer la réception
                  </p>
                </div>
                <Link
                  href="/tenant/receipts"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  Voir
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/tenant/applications"
            className="bg-white rounded-xl p-6 hover:shadow-md transition-all border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📝</span>
              <span className="text-2xl font-bold text-gray-900">
                {applicationsCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Candidatures</p>
            <p className="text-xs text-gray-500 mt-1">Total envoyées</p>
          </Link>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">⏳</span>
              <span className="text-2xl font-bold text-orange-600">
                {pendingApplications}
              </span>
            </div>
            <p className="font-medium text-gray-900">En attente</p>
            <p className="text-xs text-gray-500 mt-1">Réponse propriétaire</p>
          </div>

          <Link
            href="/tenant/leases"
            className="bg-emerald-50 rounded-xl p-6 hover:shadow-md transition-all border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🏡</span>
              <span className="text-2xl font-bold text-emerald-600">
                {activeLeases}
              </span>
            </div>
            <p className="font-medium text-gray-900">
              Bail{activeLeases > 1 ? 'x' : ''} actif
              {activeLeases > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Logement{activeLeases > 1 ? 's' : ''} actuel
              {activeLeases > 1 ? 's' : ''}
            </p>
          </Link>

          <Link
            href="/tenant/receipts"
            className="bg-blue-50 rounded-xl p-6 hover:shadow-md transition-all border border-blue-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🧾</span>
              <span className="text-2xl font-bold text-blue-600">
                {receiptsCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Quittances</p>
            <p className="text-xs text-gray-500 mt-1">Disponibles</p>
          </Link>
        </div>

        {/* Widget Services  */}
        <div className="mb-8">
          <ServicesWidget
            hasActiveLease={!!activeLease}
            propertyTitle={activeLease?.property.title}
          />
        </div>

        {/* Mon Passport */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-6 border border-rose-200 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {user.profileComplete ? (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
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
                    <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-medium">
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

            <div className="w-full md:w-auto">
              <ShareButton type="PROFILE" className="w-full md:w-auto" />
              <p className="text-center text-xs text-gray-600 mt-2">
                Partagez votre passport aux propriétaires
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mes paiements */}
            <Link
              href="/tenant/receipts"
              className="group flex items-center gap-4 p-5 bg-white rounded-xl hover:shadow-md transition-all border border-gray-200"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Mes paiements</p>
                <p className="text-sm text-gray-500 truncate">
                  Déclarer & télécharger
                </p>
              </div>
            </Link>

            {/* Mes baux */}
            <Link
              href="/tenant/leases"
              className="group flex items-center gap-4 p-5 bg-white rounded-xl hover:shadow-md transition-all border border-gray-200"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="text-2xl">📄</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Mes baux</p>
                <p className="text-sm text-gray-500 truncate">
                  Voir mes contrats
                </p>
              </div>
            </Link>

            {/* Mes candidatures */}
            <Link
              href="/tenant/applications"
              className="group flex items-center gap-4 p-5 bg-white rounded-xl hover:shadow-md transition-all border border-gray-200"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Mes candidatures</p>
                <p className="text-sm text-gray-500 truncate">
                  Suivre mes demandes
                </p>
              </div>
            </Link>

            {/* Profil */}
            <Link
              href="/profile/edit"
              className="group flex items-center gap-4 p-5 bg-purple-50 rounded-xl hover:shadow-md transition-all border border-purple-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-105 transition-transform flex-shrink-0">
                ✏️
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Mon profil</p>
                <p className="text-sm text-gray-500 truncate">Modifier</p>
              </div>
            </Link>

            {/* Profil public */}
            <Link
              href={`/profile/${user.id}`}
              className="group flex items-center gap-4 p-5 bg-blue-50 rounded-xl hover:shadow-md transition-all border border-blue-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-105 transition-transform flex-shrink-0">
                👁️
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Profil public</p>
                <p className="text-sm text-gray-500 truncate">Consulter</p>
              </div>
            </Link>

            {/* Achievements */}
            <Link
              href="/achievements"
              className="group flex items-center gap-4 p-5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl hover:shadow-md transition-all text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                🏆
              </div>
              <div className="min-w-0">
                <p className="font-semibold">Mes succès</p>
                <p className="text-sm text-yellow-100 truncate">Achievements</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
