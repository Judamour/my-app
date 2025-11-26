import { prisma } from '@/lib/prisma'
import { PRICING_PLANS, type PricingPlan, getRequiredPlan } from '@/lib/pricing'
import { boolean } from 'zod'

export interface SubscriptionStatus {
  plan: PricingPlan
  isActive: boolean
  canAddProperty: boolean
  currentCount: number
  maxProperties: number
  requiresUpgrade: boolean
  nextPlan: PricingPlan | null
}

/**
 * Vérifie le statut d'abonnement d'un utilisateur
 */
export async function checkSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionPlan: true,
      stripeCurrentPeriodEnd: true,
      _count: {
        select: {
          ownedProperties: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const plan = user.subscriptionPlan as PricingPlan
  const currentCount = user._count.ownedProperties
  const planConfig = PRICING_PLANS[plan]

  // Vérifier si l'abonnement est actif (pour les plans payants)
  const isActive = Boolean(
    plan === 'free' ||
      (user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date())
  )

  // Vérifier si on peut ajouter une propriété
  const canAddProperty = Boolean(
    currentCount < planConfig.maxProperties && isActive
  )
  // Déterminer si un upgrade est nécessaire
  const requiresUpgrade = Boolean(currentCount >= planConfig.maxProperties)

  // Trouver le prochain plan nécessaire
  let nextPlan: PricingPlan | null = null
  if (requiresUpgrade) {
    nextPlan = getRequiredPlan(currentCount + 1)
  }

  return {
    plan,
    isActive,
    canAddProperty,
    currentCount,
    maxProperties: planConfig.maxProperties,
    requiresUpgrade,
    nextPlan,
  }
}

/**
 * Vérifie si l'utilisateur peut effectuer une action selon son plan
 */
export async function canPerformAction(
  userId: string,
  action: 'add-property' | 'access-analytics' | 'export-data'
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionPlan: true,
      stripeCurrentPeriodEnd: true,
      _count: {
        select: {
          ownedProperties: true,
        },
      },
    },
  })

  if (!user) return false

  const plan = user.subscriptionPlan as PricingPlan
  const planConfig = PRICING_PLANS[plan]

  // Vérifier si l'abonnement est actif
  const isActive =
    plan === 'free' ||
    (user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date())

  if (!isActive) return false

  switch (action) {
    case 'add-property':
      return user._count.ownedProperties < planConfig.maxProperties

    case 'access-analytics':
      // Analytics disponible à partir de Pro
      return ['pro', 'business', 'enterprise'].includes(plan)

    case 'export-data':
      // Export disponible à partir de Pro
      return ['pro', 'business', 'enterprise'].includes(plan)

    default:
      return false
  }
}
