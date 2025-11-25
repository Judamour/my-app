import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BackButton from '@/components/BackButton'
import { calculateUserBadges, calculateUserRank, calculateLevelFromXP } from '@/lib/badges'
import { ALL_BADGES, getBadgesByCategory } from '@/lib/badges-config'
import { BadgeCategory } from '@/types/badge'
import RankBadge from '@/components/profile/RankBadge'
import XPProgressBar from '@/components/profile/XPProgressBar'

export default async function AchievementsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Récupérer les données utilisateur
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      xp: true,
      level: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Calculer badges et rang
  const userBadges = await calculateUserBadges(session.user.id)
  const currentLevel = calculateLevelFromXP(user.xp)
  const rankInfo = calculateUserRank(currentLevel, userBadges.length)

  // Badges débloqués (IDs)
  const unlockedBadgeIds = new Set(userBadges.map((b) => b.badgeId))

  // Organiser par catégorie
  const categories: Array<{
    id: BadgeCategory
    name: string
    color: string
  }> = [
    { id: 'PROFILE', name: '👤 Profil', color: 'from-blue-500 to-cyan-500' },
    { id: 'RELIABILITY', name: '🛡️ Fiabilité', color: 'from-green-500 to-emerald-500' },
    { id: 'PERFORMANCE', name: '⭐ Performance', color: 'from-yellow-500 to-orange-500' },
    { id: 'SOCIAL', name: '💬 Social', color: 'from-purple-500 to-pink-500' },
    { id: 'SPECIAL', name: '🌟 Spécial', color: 'from-red-500 to-rose-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-900">
            🏆 Mes achievements
          </h1>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Stats globales */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Rang */}
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Mon rang</div>
              <RankBadge rankInfo={rankInfo} level={currentLevel} size="large" />
            </div>

            {/* XP Progress */}
            <div className="flex-1 max-w-md">
              <XPProgressBar currentXP={user.xp} currentLevel={currentLevel} />
            </div>

            {/* Stats badges */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {userBadges.length}/{ALL_BADGES.length}
              </div>
              <div className="text-sm text-gray-500">Badges débloqués</div>
            </div>
          </div>
        </div>

        {/* Badges par catégorie */}
        {categories.map((category) => {
          const categoryBadges = getBadgesByCategory(category.id)
          const unlockedCount = categoryBadges.filter((b) =>
            unlockedBadgeIds.has(b.id)
          ).length

          return (
            <div key={category.id} className="mb-8">
              {/* Header catégorie */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {category.name}
                </h2>
                <span className="text-sm text-gray-500">
                  {unlockedCount}/{categoryBadges.length}
                </span>
              </div>

              {/* Grille badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryBadges.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.has(badge.id)
                  const userBadge = userBadges.find((ub) => ub.badgeId === badge.id)

                  return (
                    <div
                      key={badge.id}
                      className={`
                        relative rounded-lg p-4 text-center transition-all
                        ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 hover:shadow-lg'
                            : 'bg-gray-100 border-2 border-gray-300 opacity-60'
                        }
                      `}
                    >
                      {/* Badge icon */}
                      <div
                        className={`text-5xl mb-2 ${
                          isUnlocked ? '' : 'grayscale'
                        }`}
                      >
                        {badge.icon}
                      </div>

                      {/* Badge name */}
                      <div
                        className={`font-bold text-sm mb-1 ${
                          isUnlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {badge.name}
                      </div>

                      {/* Badge description */}
                      <div className="text-xs text-gray-600 mb-2">
                        {badge.description}
                      </div>

                      {/* XP ou condition */}
                      {isUnlocked ? (
                        <div className="text-xs font-semibold text-green-600">
                          +{badge.points} XP
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          {badge.condition}
                        </div>
                      )}

                      {/* Date unlock */}
                      {isUnlocked && userBadge && (
                        <div className="text-xs text-gray-400 mt-2">
                          Débloqué le{' '}
                          {new Date(userBadge.unlockedAt).toLocaleDateString(
                            'fr-FR'
                          )}
                        </div>
                      )}

                      {/* Lock icon pour badges verrouillés */}
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 text-gray-400">
                          🔒
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}