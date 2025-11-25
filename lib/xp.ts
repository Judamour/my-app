import { prisma } from '@/lib/prisma'
import { calculateLevelFromXP, calculateUserBadges } from '@/lib/badges'

/**
 * Configuration des XP par action
 */
export const XP_REWARDS = {
  // Propriétés
  CREATE_PROPERTY: 50,
  
  // Paiements
  MAKE_PAYMENT: 20,
  
  // Messages
  SEND_MESSAGE: 5,
  
  // Avis
  RECEIVE_POSITIVE_REVIEW: 30, // Note ≥ 4.0
  GIVE_REVIEW: 15,
  
  // Profil
  COMPLETE_PROFILE: 100, // One-time bonus
  
  // Baux
  CREATE_LEASE: 75,
  COMPLETE_LEASE: 50, // Bail terminé sans incident
  
  // Candidatures
  SUBMIT_APPLICATION: 10,
  APPLICATION_ACCEPTED: 25,
} as const

/**
 * Attribue des XP à un utilisateur et recalcule son niveau
 * Retourne les nouveaux badges débloqués (si applicable)
 */
export async function awardXP(
  userId: string,
  amount: number,
  reason: string
): Promise<{
  newXP: number
  newLevel: number
  levelUp: boolean
  newBadges: string[]
}> {
  // Récupérer l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, badges: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Badges avant l'action
  const badgesBefore = await calculateUserBadges(userId)
  const badgeIdsBefore = new Set(badgesBefore.map((b) => b.badgeId))

  // Calculer nouveaux XP et niveau
  const newXP = user.xp + amount
  const oldLevel = user.level
  const newLevel = calculateLevelFromXP(newXP)
  const levelUp = newLevel > oldLevel

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  })

  // Vérifier les nouveaux badges débloqués
  const badgesAfter = await calculateUserBadges(userId)
  const newBadges = badgesAfter
    .filter((b) => !badgeIdsBefore.has(b.badgeId))
    .map((b) => b.badgeId)

  console.log(`✅ XP attribués à ${userId}:`, {
    reason,
    amount,
    newXP,
    newLevel,
    levelUp,
    newBadges,
  })

  return {
    newXP,
    newLevel,
    levelUp,
    newBadges,
  }
}

/**
 * Attribue des XP pour la création d'une propriété
 */
export async function awardPropertyCreationXP(userId: string) {
  return awardXP(userId, XP_REWARDS.CREATE_PROPERTY, 'Création de propriété')
}

/**
 * Attribue des XP pour un paiement effectué
 */
export async function awardPaymentXP(userId: string) {
  return awardXP(userId, XP_REWARDS.MAKE_PAYMENT, 'Paiement effectué')
}

/**
 * Attribue des XP pour un message envoyé
 */
export async function awardMessageXP(userId: string) {
  return awardXP(userId, XP_REWARDS.SEND_MESSAGE, 'Message envoyé')
}

/**
 * Attribue des XP pour un avis reçu
 */
export async function awardReviewReceivedXP(userId: string, rating: number) {
  if (rating >= 4.0) {
    return awardXP(
      userId,
      XP_REWARDS.RECEIVE_POSITIVE_REVIEW,
      'Avis positif reçu'
    )
  }
  return null
}

/**
 * Attribue des XP pour avoir donné un avis
 */
export async function awardReviewGivenXP(userId: string) {
  return awardXP(userId, XP_REWARDS.GIVE_REVIEW, 'Avis soumis')
}

/**
 * Attribue des XP pour un profil complété à 100%
 */
export async function awardCompleteProfileXP(userId: string) {
  return awardXP(userId, XP_REWARDS.COMPLETE_PROFILE, 'Profil complété à 100%')
}

/**
 * Attribue des XP pour un bail créé
 */
export async function awardLeaseCreationXP(userId: string) {
  return awardXP(userId, XP_REWARDS.CREATE_LEASE, 'Bail créé')
}

/**
 * Attribue des XP pour un bail terminé
 */
export async function awardLeaseCompletionXP(userId: string) {
  return awardXP(userId, XP_REWARDS.COMPLETE_LEASE, 'Bail terminé')
}

/**
 * Attribue des XP pour une candidature soumise
 */
export async function awardApplicationSubmissionXP(userId: string) {
  return awardXP(userId, XP_REWARDS.SUBMIT_APPLICATION, 'Candidature soumise')
}

/**
 * Attribue des XP pour une candidature acceptée
 */
export async function awardApplicationAcceptedXP(userId: string) {
  return awardXP(userId, XP_REWARDS.APPLICATION_ACCEPTED, 'Candidature acceptée')
}