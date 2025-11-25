import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BackButton from '@/components/BackButton'
import Link from 'next/link'
import { calculateUserBadges, calculateUserRank, calculateLevelFromXP } from '@/lib/badges'
import { getBadgeById } from '@/lib/badges-config'
import RankedAvatar from '@/components/profile/RankedAvatar'
import RankBadge from '@/components/profile/RankBadge'
import XPProgressBar from '@/components/profile/XPProgressBar'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({ params }: PageProps) {
  // ⚠️ IMPORTANT : await params dans Next.js 15
  const { id } = await params
  
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id }, // ✅ Maintenant id est défini
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      gender: true,
      birthDate: true,
      profileComplete: true,
      role: true,
      isOwner: true,
      isTenant: true,
      createdAt: true,
      // Gamification
      xp: true,
      level: true,
      badges: true,
      // Préférences d'affichage
      showBadges: true,
      showLevel: true,
      showRankBorder: true,
      showReviewStats: true,
      showPhone: true,
      showAddress: true,
    },
  })

  if (!user) {
    notFound()
  }

  // Calcul des badges et du rang
  const userBadges = await calculateUserBadges(user.id)
  const currentLevel = calculateLevelFromXP(user.xp)
  const rankInfo = calculateUserRank(currentLevel, userBadges.length)

  // Récupérer les détails des badges débloqués
  const unlockedBadgesDetails = userBadges
    .map((ub) => {
      const badge = getBadgeById(ub.badgeId)
      return badge ? { ...badge, unlockedAt: ub.unlockedAt } : null
    })
    .filter(Boolean)

  const isOwnProfile = session.user.id === user.id

  // Stats pour avis (si activé) - targetId au lieu de reviewedUserId
  const reviewStats = user.showReviewStats
    ? await prisma.review.aggregate({
        where: { targetId: user.id },
        _avg: { rating: true },
        _count: { id: true },
      })
    : null

  const hasReviews = reviewStats?._count?.id && reviewStats._count.id > 0

  return (
    // ... reste du JSX inchangé


    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec boutons */}
        <div className="mb-6 flex items-center justify-between">
          <BackButton />
          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              ✏️ Modifier mon profil
            </Link>
          )}
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header avec avatar et infos principales */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            {/* Avatar avec bordure de rang */}
            <RankedAvatar
              firstName={user.firstName || 'U'}
              lastName={user.lastName || 'U'}
              rankInfo={rankInfo}
              showBorder={user.showRankBorder}
              size="large"
            />

            {/* Infos utilisateur */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h1>

              {/* Badge de rang */}
              {user.showRankBorder && rankInfo.rank !== 'NONE' && (
                <div className="mb-3">
                  <RankBadge
                    rankInfo={rankInfo}
                    level={currentLevel}
                    showLevel={user.showLevel}
                    size="medium"
                  />
                </div>
              )}

              {/* Rôles */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {user.isTenant && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    🏠 Locataire
                  </span>
                )}
                {user.isOwner && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    🏢 Propriétaire
                  </span>
                )}
                {user.role === 'ADMIN' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    👑 Admin
                  </span>
                )}
              </div>

              {/* Barre de progression XP */}
              {user.showLevel && (
                <div className="mb-4">
                  <XPProgressBar currentXP={user.xp} currentLevel={currentLevel} />
                </div>
              )}

              {/* Stats avis */}
              {user.showReviewStats && hasReviews && reviewStats && (
                <div className="flex items-center gap-4 justify-center md:justify-start text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">
                      {reviewStats._avg?.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div>•</div>
                  <div>{reviewStats._count.id} avis</div>
                </div>
              )}
            </div>
          </div>

          {/* Badges débloqués */}
          {user.showBadges && unlockedBadgesDetails.length > 0 && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🏆 Badges débloqués ({unlockedBadgesDetails.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {unlockedBadgesDetails.map((badge) => {
                  if (!badge) return null
                  return (
                    <div
                      key={badge.id}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-bold text-sm text-gray-900 mb-1">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {badge.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        +{badge.points} XP
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Informations de contact */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📞 Informations de contact
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium w-32">Email :</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              {user.showPhone && user.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-medium w-32">
                    Téléphone :
                  </span>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              )}
              {user.showAddress && user.address && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-medium w-32">
                    Adresse :
                  </span>
                  <span className="text-gray-900">{user.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations personnelles */}
          {(user.gender || user.birthDate) && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                👤 Informations personnelles
              </h2>
              <div className="space-y-3">
                {user.gender && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-32">
                      Genre :
                    </span>
                    <span className="text-gray-900">
                      {user.gender === 'MALE'
                        ? 'Homme'
                        : user.gender === 'FEMALE'
                        ? 'Femme'
                        : 'Autre'}
                    </span>
                  </div>
                )}
                {user.birthDate && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-32">
                      Date de naissance :
                    </span>
                    <span className="text-gray-900">
                      {new Date(user.birthDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Membre depuis */}
          <div className="border-t pt-6 mt-6">
            <div className="text-sm text-gray-500 text-center">
              Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}