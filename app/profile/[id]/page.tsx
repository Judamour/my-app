import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ContactButton from '@/components/messages/ContactButton'
import BackButton from '@/components/BackButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/login?redirect=/profile/${id}`)
  }

  // Récupérer le profil (sans données sensibles)
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      gender: true,
      phone: true,
      address: true,
      profileComplete: true,
      createdAt: true,
      isTenant: true,
      isOwner: true,
      // PAS email ni birthDate (données privées)
    },
  })

  if (!user) {
    notFound()
  }

  // Vérifier que le visiteur a le droit de voir ce profil
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOwner: true, isTenant: true },
  })

  const hasAccess = await checkProfileAccess(
    session.user.id,
    id,
    currentUser?.isOwner || false
  )

  if (!hasAccess && session.user.id !== id) {
    redirect('/')
  }

  // Calculer les badges du locataire
  const badges = await calculateBadges(id)

  // Récupérer la note moyenne (si système d'avis existe)
  const rating = await getAverageRating(id)

  // Ancienneté
  const memberSince = new Date(user.createdAt)
  const now = new Date()
  const monthsDiff =
    (now.getFullYear() - memberSince.getFullYear()) * 12 +
    (now.getMonth() - memberSince.getMonth())
  const memberDuration =
    monthsDiff < 12
      ? `${monthsDiff || 1} mois`
      : `${Math.floor(monthsDiff / 12)} an${
          Math.floor(monthsDiff / 12) > 1 ? 's' : ''
        }`

  const getGenderLabel = (gender: string | null) => {
    const labels: Record<string, string> = {
      MALE: 'Monsieur',
      FEMALE: 'Madame',
      OTHER: 'Autre',
      PREFER_NOT_TO_SAY: 'Non précisé',
    }
    return gender ? labels[gender] || '' : ''
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <BackButton />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Profil header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
          {/* Avatar */}
          <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>

            {/* Note moyenne */}
            {rating.count > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.round(rating.average)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {rating.average.toFixed(1)}
                </span>
                <span className="text-gray-400 text-sm">
                  ({rating.count} avis)
                </span>
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              {user.isTenant && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  🔑 Locataire
                </span>
              )}
              {user.isOwner && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  🏠 Propriétaire
                </span>
              )}
              {user.profileComplete && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✓ Vérifié
                </span>
              )}
            </div>

            <p className="text-gray-500 mt-3">Membre depuis {memberDuration}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🏆 Badges
              </h2>

              {badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="font-medium text-gray-900 text-sm">
                        {badge.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {badge.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🏅</span>
                  </div>
                  <p className="text-gray-400">Aucun badge pour le moment</p>
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations
              </h2>

              <div className="space-y-4">
                {user.gender && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Civilité</p>
                      <p className="font-medium text-gray-900">
                        {getGenderLabel(user.gender)}
                      </p>
                    </div>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">📱</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">📍</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Adresse</p>
                      <p className="font-medium text-gray-900">
                        {user.address}
                      </p>
                    </div>
                  </div>
                )}

                {!user.gender && !user.phone && !user.address && (
                  <div className="text-center py-6">
                    <p className="text-gray-400">
                      Aucune information complémentaire
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Avis reçus */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ⭐ Avis des propriétaires
              </h2>

              {rating.count > 0 ? (
                <div className="space-y-4">
                  {/* Les avis seront affichés ici quand le système sera implémenté */}
                  <p className="text-gray-500 text-sm">
                    Ce locataire a reçu {rating.count} avis positif
                    {rating.count > 1 ? 's' : ''}.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-gray-400">Aucun avis pour le moment</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Les avis apparaîtront après la fin d&apos;un bail
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Indicateurs de fiabilité */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Fiabilité</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      user.profileComplete
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {user.profileComplete ? '✓' : '○'}
                  </span>
                  <span
                    className={
                      user.profileComplete ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    Profil complété
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      user.phone
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {user.phone ? '✓' : '○'}
                  </span>
                  <span
                    className={user.phone ? 'text-gray-900' : 'text-gray-400'}
                  >
                    Téléphone renseigné
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      badges.length > 0
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {badges.length > 0 ? '✓' : '○'}
                  </span>
                  <span
                    className={
                      badges.length > 0 ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    Badges obtenus
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      rating.count > 0
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {rating.count > 0 ? '✓' : '○'}
                  </span>
                  <span
                    className={
                      rating.count > 0 ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    Avis positifs
                  </span>
                </div>
              </div>
            </div>

            {/* Message de confiance */}
            {user.profileComplete ? (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Profil de confiance
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Ce profil a été complété et vérifié.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Profil incomplet
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Ce profil n&apos;a pas été entièrement complété.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Bouton Contacter */}
            {session.user.id !== id && (
              <ContactButton recipientId={id} recipientName={user.firstName} />
            )}
            {/* Note de sécurité */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600">
                🔒 Les informations sensibles (email, date de naissance) sont
                protégées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Vérifier si l'utilisateur a accès au profil
// Vérifier si l'utilisateur a accès au profil
async function checkProfileAccess(
  viewerId: string,
  profileId: string,
  isOwner: boolean
): Promise<boolean> {
  if (viewerId === profileId) return true

  // Si le viewer est propriétaire, peut voir les locataires qui ont postulé ou ont un bail
  if (isOwner) {
    const hasApplication = await prisma.application.findFirst({
      where: {
        tenantId: profileId,
        property: { ownerId: viewerId },
      },
    })
    if (hasApplication) return true

    const hasLease = await prisma.lease.findFirst({
      where: {
        tenantId: profileId,
        property: { ownerId: viewerId },
      },
    })
    if (hasLease) return true
  }

  // Si le viewer est locataire, peut voir les propriétaires où il a postulé ou a un bail
  const hasApplicationAsViewer = await prisma.application.findFirst({
    where: {
      tenantId: viewerId,
      property: { ownerId: profileId },
    },
  })
  if (hasApplicationAsViewer) return true

  const hasLeaseAsViewer = await prisma.lease.findFirst({
    where: {
      tenantId: viewerId,
      property: { ownerId: profileId },
    },
  })
  if (hasLeaseAsViewer) return true

  return false
}

// Calculer les badges du locataire
async function calculateBadges(userId: string) {
  const badges: { icon: string; name: string; description: string }[] = []

  // Badge "Premier pas" - A complété son profil
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileComplete: true, createdAt: true },
  })

  if (user?.profileComplete) {
    badges.push({
      icon: '🌟',
      name: 'Premier pas',
      description: 'Profil complété',
    })
  }

  // Badge "Locataire fidèle" - A eu au moins 1 bail terminé
  const endedLeases = await prisma.lease.count({
    where: { tenantId: userId, status: 'ENDED' },
  })

  if (endedLeases >= 1) {
    badges.push({
      icon: '🏡',
      name: 'Locataire fidèle',
      description: `${endedLeases} bail${endedLeases > 1 ? 's' : ''} terminé${
        endedLeases > 1 ? 's' : ''
      }`,
    })
  }

  // Badge "Ponctuel" - Tous paiements à temps (simulé pour l'instant)
  const receipts = await prisma.receipt.count({
    where: {
      lease: { tenantId: userId },
      status: 'CONFIRMED',
    },
  })

  if (receipts >= 3) {
    badges.push({
      icon: '⏰',
      name: 'Ponctuel',
      description: 'Paiements réguliers',
    })
  }

  // Badge "Vétéran" - Membre depuis plus d'1 an
  if (user) {
    const memberMonths = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    )
    if (memberMonths >= 12) {
      badges.push({
        icon: '🎖️',
        name: 'Vétéran',
        description: 'Membre depuis 1 an+',
      })
    }
  }

  // Badge "Communicant" - A un téléphone renseigné
  const userPhone = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  })

  if (userPhone?.phone) {
    badges.push({
      icon: '📞',
      name: 'Communicant',
      description: 'Joignable facilement',
    })
  }

  return badges
}

// Récupérer la note moyenne (préparé pour le système d'avis)
async function getAverageRating(userId: string) {
  // TODO: Implémenter quand le système de reviews sera créé
  // Pour l'instant, retourne des valeurs par défaut
  return {
    average: 0,
    count: 0,
  }
}
