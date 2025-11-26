import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import UnreadMessagesButton from '@/components/messages/UnreadMessagesButton'
import { checkSubscriptionStatus } from '@/lib/subscription'
import { PRICING_PLANS } from '@/lib/pricing'


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

  const activeLeasesCount = await prisma.lease.count({
    where: {
      property: { ownerId: user.id },
      status: 'ACTIVE',
    },
  })

  const receiptsCount = await prisma.receipt.count({
    where: {
      lease: {
        property: { ownerId: user.id },
      },
      status: 'CONFIRMED',
    },
  })

  const pendingPayments = await prisma.receipt.count({
    where: {
      lease: {
        property: { ownerId: user.id },
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
        property: { ownerId: user.id },
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
        property: { ownerId: user.id },
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm mb-1">Bienvenue</p>
              <h1 className="text-3xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <UnreadMessagesButton userId={user.id} />
              {user.isTenant && (
                <Link
                  href="/tenant"
                  className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <span className="text-xl">🔑</span>
                  <span className="font-medium text-gray-700">
                    Mode locataire
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

 

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Alerte profil incomplet */}
        {!user.profileComplete && (
          <div className="mb-10 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
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

        {/* Alerte paiements en attente */}
        {pendingPayments > 0 && (
          <div className="mb-10 bg-orange-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {pendingPayments} paiement{pendingPayments > 1 ? 's' : ''} à
                  confirmer
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Des locataires ont déclaré avoir payé leur loyer
                </p>
              </div>
              <Link
                href="/owner/receipts"
                className="px-5 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Voir
              </Link>
            </div>
          </div>
        )}

        {/* Carte Revenus du mois */}
        <Link
          href="/owner/payments"
          className="block mb-10 bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
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
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-sm text-emerald-100">
              Voir le détail des paiements
            </span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Link
            href="/owner/properties"
            className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors block"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🏠</span>
              <span className="text-3xl font-semibold text-gray-900">
                {propertiesCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Mes biens</p>
            <p className="text-sm text-gray-500 mt-1">Total propriétés</p>
          </Link>

          <div className="bg-blue-50 rounded-2xl p-6 hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">✅</span>
              <span className="text-3xl font-semibold text-blue-600">
                {availableCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Disponibles</p>
            <p className="text-sm text-gray-500 mt-1">Prêts à louer</p>
          </div>

          <Link
            href="/owner/applications"
            className="bg-orange-50 rounded-2xl p-6 hover:bg-orange-100 transition-colors block"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📝</span>
              <span className="text-3xl font-semibold text-orange-600">
                {applicationsCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Candidatures</p>
            <p className="text-sm text-gray-500 mt-1">En attente</p>
          </Link>

          <Link
            href="/owner/leases"
            className="bg-emerald-50 rounded-2xl p-6 hover:bg-emerald-100 transition-colors block"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📄</span>
              <span className="text-3xl font-semibold text-emerald-600">
                {activeLeasesCount}
              </span>
            </div>
            <p className="font-medium text-gray-900">Baux actifs</p>
            <p className="text-sm text-gray-500 mt-1">Locations en cours</p>
          </Link>
        </div>

        {/* Actions rapides */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Actions rapides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* ✅ NOUVEAU : Bandeau statut abonnement */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Plan actuel : {planConfig.name}
              </h3>
              <p className="text-gray-600">
                {subscriptionStatus.currentCount}/{subscriptionStatus.maxProperties} propriétés utilisées
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Barre de progression */}
              <div className="w-48">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      subscriptionStatus.currentCount >= subscriptionStatus.maxProperties
                        ? 'bg-red-500'
                        : subscriptionStatus.currentCount >= subscriptionStatus.maxProperties - 1
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${(subscriptionStatus.currentCount / subscriptionStatus.maxProperties) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bouton upgrade si nécessaire */}
              {subscriptionStatus.plan !== 'enterprise' && (
                <Link
                  href="/pricing"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    subscriptionStatus.requiresUpgrade
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {subscriptionStatus.requiresUpgrade ? 'Upgrader maintenant' : 'Voir les plans'}
                </Link>
              )}
            </div>
          </div>
        </div>
            {/* Ajouter un bien */}
            <Link
              href="/owner/properties/new"
              className="group flex items-center gap-5 p-6 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all duration-200"
            >
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl">➕</span>
              </div>
              <div>
                <p className="font-semibold text-white text-lg">
                  Ajouter un bien
                </p>
                <p className="text-gray-300 mt-1">Créer une nouvelle fiche</p>
              </div>
            </Link>

            {/* Mes propriétés */}
            <Link
              href="/owner/properties"
              className="group flex items-center gap-5 p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  Mes propriétés
                </p>
                <p className="text-gray-500 mt-1">Gérer mes biens</p>
              </div>
            </Link>

            {/* Quittances */}
            <Link
              href="/owner/receipts"
              className="group flex items-center gap-5 p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl">🧾</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  Quittances
                </p>
                <p className="text-gray-500 mt-1">
                  {receiptsCount} générée{receiptsCount > 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          </div>

          {/* 🆕 Modifier mon profil - 2ème ligne */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/profile/edit"
              className="group flex items-center gap-5 p-6 border-2 border-purple-200 rounded-2xl hover:border-purple-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-105 transition-transform">
                ✏️
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  Modifier mon profil
                </p>
                <p className="text-gray-500 mt-1">
                  Informations & confidentialité
                </p>
              </div>
            </Link>
          </div>
          {/* 🆕 Voir mon profil public */}
          <Link
            href={`/profile/${session.user.id}`}
            className="group flex items-center gap-5 p-6 border-2 border-blue-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-105 transition-transform">
              👁️
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                Mon profil public
              </p>
              <p className="text-gray-500 mt-1">
                Voir ce que les autres voient
              </p>
            </div>
          </Link>
          {/* NOUVELLE CARTE Achievements */}
          <Link
            href="/achievements"
            className="flex flex-col items-center justify-center p-8 bg-linear-to-br from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold">Mes achievements</h3>
          </Link>
        </div>
        {/* Messages */}
        <Link
          href="/messages"
          className="group flex items-center gap-5 p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">Messages</p>
            <p className="text-gray-500 mt-1">Mes conversations</p>
          </div>
        </Link>

        {/* Candidatures récentes */}
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
                {applicationsCount} candidature
                {applicationsCount > 1 ? 's' : ''} en attente
              </p>
              <Link
                href="/owner/applications"
                className="inline-flex items-center gap-2 mt-4 text-orange-600 font-medium hover:text-orange-700"
              >
                Voir les candidatures
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Déconnexion */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
