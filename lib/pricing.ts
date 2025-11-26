export type PricingPlan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

export interface PlanConfig {
  id: PricingPlan
  name: string
  description: string
  maxProperties: number
  price: number | null
  priceId: string | null // Stripe Price ID
  features: string[]
  popular?: boolean
}

export const PRICING_PLANS: Record<PricingPlan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour débuter',
    maxProperties: 4,
    price: 0,
    priceId: null,
    features: [
      "Jusqu'à 4 propriétés",
      'Gestion des candidatures',
      'Messagerie intégrée',
      "Système d'avis",
      'Gamification',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Pour propriétaires actifs',
    maxProperties: 10,
    price: 39.9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || null, // À configurer
    popular: true,
    features: [
      "Jusqu'à 10 propriétés",
      'Toutes les fonctionnalités Gratuit',
      'Quittances automatiques',
      'Support prioritaire',
      'Statistiques avancées',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Pour multi-propriétaires',
    maxProperties: 25,
    price: 79.9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || null,
    features: [
      "Jusqu'à 25 propriétés",
      'Toutes les fonctionnalités Starter',
      'Dashboard analytics',
      'Export données CSV',
      'API access',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'Pour professionnels',
    maxProperties: 50,
    price: 149.9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || null,
    features: [
      "Jusqu'à 50 propriétés",
      'Toutes les fonctionnalités Pro',
      'Branding personnalisé',
      'Support dédié',
      'Intégrations avancées',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour agences immobilières',
    maxProperties: 999,
    price: null, // Sur devis
    priceId: null,
    features: [
      'Propriétés illimitées',
      'Toutes les fonctionnalités Business',
      'Multi-utilisateurs',
      'Formation personnalisée',
      'SLA garanti',
      'Tarif sur mesure',
    ],
  },
}

/**
 * Détermine le plan requis selon le nombre de propriétés
 */
export function getRequiredPlan(propertyCount: number): PricingPlan {
  if (propertyCount <= 4) return 'free'
  if (propertyCount <= 10) return 'starter'
  if (propertyCount <= 25) return 'pro'
  if (propertyCount <= 50) return 'business'
  return 'enterprise'
}

/**
 * Vérifie si un utilisateur peut ajouter une propriété selon son plan
 */
export function canAddProperty(
  currentCount: number,
  plan: PricingPlan
): boolean {
  const planConfig = PRICING_PLANS[plan]
  return currentCount < planConfig.maxProperties
}

/**
 * Récupère le plan suivant suggéré
 */
export function getNextPlan(currentPlan: PricingPlan): PlanConfig | null {
  const plans: PricingPlan[] = [
    'free',
    'starter',
    'pro',
    'business',
    'enterprise',
  ]
  const currentIndex = plans.indexOf(currentPlan)

  if (currentIndex === -1 || currentIndex === plans.length - 1) {
    return null
  }

  return PRICING_PLANS[plans[currentIndex + 1]]
}

/**
 * Calcule le prix par propriété pour un plan
 */
export function getPricePerProperty(plan: PricingPlan): number | null {
  const planConfig = PRICING_PLANS[plan]
  if (planConfig.price === null || planConfig.price === 0) return null

  // Calcul basé sur le milieu de la fourchette
  const avgProperties =
    planConfig.maxProperties > 10
      ? (planConfig.maxProperties + getMinProperties(plan)) / 2
      : planConfig.maxProperties

  return planConfig.price / avgProperties
}

function getMinProperties(plan: PricingPlan): number {
  if (plan === 'starter') return 5
  if (plan === 'pro') return 11
  if (plan === 'business') return 26
  if (plan === 'enterprise') return 51
  return 1
}
