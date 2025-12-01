import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { checkSubscriptionStatus } from '@/lib/subscription'
import { PRICING_PLANS } from '@/lib/pricing'
import AnalyticsSection from '@/components/analytics/AnalyticsSection'

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

  if (!session?.user?.id) {
    redirect('/login')
  }

  const subscriptionStatus = await checkSubscriptionStatus(session.user.id)
  const planConfig = PRICING_PLANS[subscriptionStatus.plan]

  if (!user) {
    redirect('/login')
  }



  const propertiesCount = await prisma.property.count({
    where: {
      ownerId: user.id,
      deletedAt: null, // 🆕
    },
  })

  const availableCount = await prisma.property.count({
    where: {
      ownerId: user.id,
      available: true,
      deletedAt: null,
    },
  })

  const applicationsCount = await prisma.application.count({
    where: {
      property: {
        ownerId: user.id,
        deletedAt: null,
      },
      status: 'PENDING',
    },
  })

  const activeLeasesCount = await prisma.lease.count({
    where: {
      property: { ownerId: user.id, deletedAt: null },
      status: 'ACTIVE',
      deletedAt: null,
    },
  })

  const receiptsCount = await prisma.receipt.count({
    where: {
      lease: {
        property: {
          ownerId: user.id,
          deletedAt: null, // 🆕
        },
        deletedAt: null, // 🆕
      },
      status: 'CONFIRMED',
    },
  })

  const pendingPayments = await prisma.receipt.count({
    where: {
      lease: {
        property: {
          ownerId: user.id,
          deletedAt: null, // 🆕
        },
        deletedAt: null, // 🆕
      },
      status: 'DECLARED',
    },
  })

  // Calcul des revenus du mois en cours
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  )

  const monthlyPayments = await prisma.receipt.findMany({
    where: {
      lease: {
        property: {
          ownerId: user.id,
          deletedAt: null, // 🆕
        },
        deletedAt: null, // 🆕
      },
      status: 'CONFIRMED',
      paidAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: {
      totalAmount: true,
    },
  })

  const monthlyTotal = monthlyPayments.reduce(
    (sum, r) => sum + r.totalAmount,
    0
  )

  // Total tous temps
  const allTimePayments = await prisma.receipt.aggregate({
    where: {
      lease: {
        property: {
          ownerId: user.id,
          deletedAt: null, // 🆕
        },
        deletedAt: null, // 🆕
      },
      status: 'CONFIRMED',
    },
    _sum: {
      totalAmount: true,
    },
  })

  const allTimeTotal = allTimePayments._sum?.totalAmount || 0

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = () => {
    return new Date().toLocaleDateString('fr-FR', { month: 'long' })
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
          {!user.profileComplete && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    Complétez votre profil
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Un profil complet inspire confiance aux locataires
                  </p>
                </div>
                <Link
                  href="/profile/complete"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  Compléter
                </Link>
              </div>
            </div>
          )}

          {/* Alerte paiements en attente */}
          {pendingPayments > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {pendingPayments} paiement{pendingPayments > 1 ? 's' : ''} à
                    confirmer
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Des locataires ont déclaré avoir payé leur loyer
                  </p>
                </div>
                <Link
                  href="/owner/receipts?pending=true"
                  className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors flex-shrink-0"
                >
                  Voir
                </Link>
              </div>
            </div>
          )}

          {/* Bandeau abonnement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Plan actuel : {planConfig.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {subscriptionStatus.currentCount}/
                  {subscriptionStatus.maxProperties} propriétés utilisées
                </p>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                {/* Barre de progression */}
                <div className="flex-1 lg:w-48">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        subscriptionStatus.currentCount >=
                        subscriptionStatus.maxProperties
                          ? 'bg-red-500'
                          : subscriptionStatus.currentCount >=
                              subscriptionStatus.maxProperties - 1
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min((subscriptionStatus.currentCount / subscriptionStatus.maxProperties) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Bouton upgrade */}
                {subscriptionStatus.plan !== 'enterprise' && (
                  <Link
                    href="/pricing"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      subscriptionStatus.requiresUpgrade
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {subscriptionStatus.requiresUpgrade
                      ? 'Upgrader'
                      : 'Voir les plans'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carte Revenus */}
        <Link
          href="/owner/receipts"
          className="block mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">
                Revenus {getMonthName()}
              </p>
              <p className="text-4xl font-bold">{formatPrice(monthlyTotal)}</p>
              <p className="text-emerald-100 text-sm mt-2">
                Total perçu : {formatPrice(allTimeTotal)}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </Link>

        {/* Analytics */}
        <AnalyticsSection />

        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/owner/properties"
            className="bg-white rounded-xl p-6 hover:shadow-md transition-all border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🏠</span>
              <span className="text-2xl font-bold text-gray-900">
                {propertiesCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Mes biens</p>
            <p className="text-xs text-gray-500 mt-1">Total propriétés</p>
          </Link>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">✅</span>
              <span className="text-2xl font-bold text-blue-600">
                {availableCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Disponibles</p>
            <p className="text-xs text-gray-500 mt-1">Prêts à louer</p>
          </div>

          <Link
            href="/owner/applications"
            className="bg-orange-50 rounded-xl p-6 hover:shadow-md transition-all border border-orange-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📝</span>
              <span className="text-2xl font-bold text-orange-600">
                {applicationsCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Candidatures</p>
            <p className="text-xs text-gray-500 mt-1">En attente</p>
          </Link>

          <Link
            href="/owner/leases"
            className="bg-emerald-50 rounded-xl p-6 hover:shadow-md transition-all border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📄</span>
              <span className="text-2xl font-bold text-emerald-600">
                {activeLeasesCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Baux actifs</p>
            <p className="text-xs text-gray-500 mt-1">Locations en cours</p>
          </Link>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ajouter un bien */}
            <Link
              href="/owner/properties/new"
              className="group flex items-center gap-4 p-5 bg-gray-900 rounded-xl hover:bg-gray-800 transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="text-2xl">➕</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">Ajouter un bien</p>
                <p className="text-sm text-gray-300 truncate">Nouvelle fiche</p>
              </div>
            </Link>

            {/* Mes propriétés */}
            <Link
              href="/owner/properties"
              className="group flex items-center gap-4 p-5 bg-white rounded-xl hover:shadow-md transition-all border border-gray-200"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Mes propriétés</p>
                <p className="text-sm text-gray-500 truncate">
                  Gérer mes biens
                </p>
              </div>
            </Link>

            {/* Quittances */}
            <Link
              href="/owner/receipts"
              className="group flex items-center gap-4 p-5 bg-white rounded-xl hover:shadow-md transition-all border border-gray-200"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="text-2xl">🧾</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Quittances</p>
                <p className="text-sm text-gray-500 truncate">
                  {receiptsCount} générée{receiptsCount > 1 ? 's' : ''}
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
