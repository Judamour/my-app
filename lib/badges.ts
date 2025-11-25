import { prisma } from '@/lib/prisma'
import { getBadgeById } from '@/lib/badges-config'
import { UserBadge } from '@/types/badge'

export type UserRank = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'NONE'

export interface RankInfo {
  rank: UserRank
  name: string
  color: string
  gradient: string
  icon: string
}

/**
 * Calcule tous les badges débloqués par un utilisateur
 */
export async function calculateUserBadges(userId: string): Promise<UserBadge[]> {
  const unlockedBadges: UserBadge[] = []
  const now = new Date()

  // Récupérer les données utilisateur
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileComplete: true,
      phone: true,
      address: true,
      gender: true,
      birthDate: true,
      createdAt: true,
      xp: true,
      level: true,
    },
  })

  if (!user) return []

  // Calculer l'ancienneté en mois
  const memberMonths = Math.floor(
    (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )

  // Récupérer les données en parallèle
  const [endedLeases, receipts, sentMessages, reviews, properties] = await Promise.all([
    // Baux terminés
    prisma.lease.count({
      where: {
        tenantId: userId,
        endDate: { lt: now },
      },
    }),

    // Paiements effectués
    prisma.receipt.count({
      where: { lease: { tenantId: userId } },
    }),

    // Messages envoyés
    prisma.message.count({
      where: { senderId: userId },
    }),

    // Avis reçus avec note et caution
    prisma.review.findMany({
      where: { targetId: userId }, // ✅ CORRIGÉ : targetId au lieu de reviewedUserId
      select: {
        rating: true,
        depositReturnedPercent: true,
      },
    }),

    // Propriétés possédées
    prisma.property.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
  ])

  // Calculer les stats d'avis
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const highRatedReviews = reviews.filter((r) => r.rating >= 4.5).length

  const depositCount100 = reviews.filter((r) => r.depositReturnedPercent === 100).length

  // Compter propriétés actives
  const activeProperties = properties.length

  // --- VÉRIFICATION DES BADGES ---

  // PROFILE
  if (user.profileComplete) {
    unlockedBadges.push({ badgeId: 'first-steps', unlockedAt: now })
  }

  if (user.phone) {
    unlockedBadges.push({ badgeId: 'communicator', unlockedAt: now })
  }

  if (
    user.profileComplete &&
    user.phone &&
    user.address &&
    user.gender &&
    user.birthDate
  ) {
    unlockedBadges.push({ badgeId: 'complete-profile', unlockedAt: now })
  }

  // RELIABILITY
  if (endedLeases >= 1) {
    unlockedBadges.push({ badgeId: 'loyal-tenant', unlockedAt: now })
  }

  if (memberMonths >= 12) {
    unlockedBadges.push({ badgeId: 'veteran', unlockedAt: now })
  }

  // PERFORMANCE
  if (averageRating >= 4.5 && reviews.length >= 3) {
    unlockedBadges.push({ badgeId: 'super-tenant', unlockedAt: now })
  }

  if (depositCount100 >= 3) {
    unlockedBadges.push({ badgeId: 'flawless', unlockedAt: now })
  }

  if (highRatedReviews >= 5) {
    unlockedBadges.push({ badgeId: 'five-stars', unlockedAt: now })
  }

  // PAIEMENTS
  if (receipts >= 3) {
    unlockedBadges.push({ badgeId: 'punctual', unlockedAt: now })
  }

  // SOCIAL
  if (sentMessages >= 10) {
    unlockedBadges.push({ badgeId: 'chatty', unlockedAt: now })
  }

  if (sentMessages >= 50) {
    unlockedBadges.push({ badgeId: 'social-butterfly', unlockedAt: now })
  }

  // PROPRIÉTAIRES
  if (activeProperties >= 3) {
    unlockedBadges.push({ badgeId: 'landlord-pro', unlockedAt: now })
  }

  if (properties.length >= 5) {
    unlockedBadges.push({ badgeId: 'investor', unlockedAt: now })
  }

  if (averageRating >= 4.5 && reviews.length >= 3) {
    unlockedBadges.push({ badgeId: 'five-star-host', unlockedAt: now })
  }

  // SPECIAL - Early Adopter (vérifier si dans les 100 premiers)
  const userRank = await prisma.user.count({
    where: {
      createdAt: { lt: user.createdAt },
    },
  })

  if (userRank < 100) {
    unlockedBadges.push({ badgeId: 'early-adopter', unlockedAt: now })
  }

  return unlockedBadges
}

/**
 * Calcule le rang d'un utilisateur en fonction de son niveau et du nombre de badges
 */
export function calculateUserRank(level: number, badgeCount: number): RankInfo {
  if (level >= 20 && badgeCount >= 15) {
    return {
      rank: 'DIAMOND',
      name: 'Diamant',
      color: 'from-purple-500 via-pink-500 to-yellow-400',
      gradient: 'from-purple-500 via-pink-500 to-yellow-400',
      icon: '💎',
    }
  }

  if (level >= 15 && badgeCount >= 12) {
    return {
      rank: 'PLATINUM',
      name: 'Platine',
      color: 'from-cyan-400 to-blue-500',
      gradient: 'from-cyan-400 to-blue-500',
      icon: '💠',
    }
  }

  if (level >= 10 && badgeCount >= 8) {
    return {
      rank: 'GOLD',
      name: 'Or',
      color: 'from-yellow-400 to-yellow-600',
      gradient: 'from-yellow-400 to-yellow-600',
      icon: '🟡',
    }
  }

  if (level >= 5 && badgeCount >= 5) {
    return {
      rank: 'SILVER',
      name: 'Argent',
      color: 'from-gray-400 to-gray-500',
      gradient: 'from-gray-400 to-gray-500',
      icon: '🩶',
    }
  }

  if (level >= 2 && badgeCount >= 2) {
    return {
      rank: 'BRONZE',
      name: 'Bronze',
      color: 'from-amber-600 to-amber-700',
      gradient: 'from-amber-600 to-amber-700',
      icon: '🟤',
    }
  }

  return {
    rank: 'NONE',
    name: 'Débutant',
    color: 'from-gray-300 to-gray-400',
    gradient: 'from-gray-300 to-gray-400',
    icon: '⚪',
  }
}

/**
 * Calcule le niveau à partir des XP
 */
export function calculateLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100))
}

/**
 * Calcule les XP nécessaires pour atteindre le prochain niveau
 */
export function getXPForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) ** 2 * 100
}