// Critères pour locataires (évalués par propriétaires)
export interface TenantCriteria {
  cleanliness: number        // Propreté et entretien
  respectProperty: number    // Respect du bien
  paymentPunctuality: number // Ponctualité des paiements
  communication: number      // Communication
  neighborRelations: number  // Relations de voisinage
}

// Critères pour propriétaires (évalués par locataires)
export interface OwnerCriteria {
  propertyCondition: number  // État du logement à l'entrée
  responsiveness: number     // Réactivité aux demandes
  respectCommitments: number // Respect des engagements
  communication: number      // Communication
  fairness: number          // Équité et honnêteté
}

export type ReviewCriteria = TenantCriteria | OwnerCriteria

// Labels français
export const TENANT_CRITERIA_LABELS: Record<keyof TenantCriteria, string> = {
  cleanliness: 'Propreté et entretien',
  respectProperty: 'Respect du bien',
  paymentPunctuality: 'Ponctualité des paiements',
  communication: 'Communication',
  neighborRelations: 'Relations de voisinage',
}

export const OWNER_CRITERIA_LABELS: Record<keyof OwnerCriteria, string> = {
  propertyCondition: 'État du logement',
  responsiveness: 'Réactivité',
  respectCommitments: 'Respect des engagements',
  communication: 'Communication',
  fairness: 'Équité et honnêteté',
}

// Calcul de la note finale
export function calculateFinalRating(
  criteria: ReviewCriteria,
  depositReturned?: boolean,
  depositReturnedPercent?: number
): number {
  // Moyenne des critères
  const criteriaValues = Object.values(criteria) as number[]
  const criteriaAverage = criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length

  // Si pas de caution (locataire évalue proprio), note = moyenne critères
  if (depositReturned === undefined) {
    return Math.round(criteriaAverage * 10) / 10
  }

  // Si caution 100% rendue
  if (depositReturned && (!depositReturnedPercent || depositReturnedPercent === 100)) {
    return Math.round((criteriaAverage * 0.25 + 5 * 0.75) * 10) / 10
  }

  // Si caution partiellement rendue
  if (depositReturnedPercent && depositReturnedPercent > 0 && depositReturnedPercent < 100) {
    const depositScore = (depositReturnedPercent / 100) * 5
    return Math.round((criteriaAverage * 0.25 + depositScore * 0.75) * 10) / 10
  }

  // Si caution retenue (0%)
  return Math.round((criteriaAverage * 0.25) * 10) / 10
}