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
// isOwnerRating = true : propriétaire note un locataire (caution rendue par proprio)
// isOwnerRating = false : locataire note un proprio (caution reçue par locataire)
export function calculateFinalRating(
  criteria: ReviewCriteria,
  depositReturned?: boolean,
  depositReturnedPercent?: number,
  isOwnerRating: boolean = true
): number {
  // Moyenne des critères
  const criteriaValues = Object.values(criteria) as number[]
  const criteriaAverage = criteriaValues.reduce((sum, val) => sum + val, 0) / criteriaValues.length

  // Si pas de caution indiquée, note = moyenne critères
  if (depositReturned === undefined) {
    return Math.round(criteriaAverage * 10) / 10
  }

  if (isOwnerRating) {
    // PROPRIO NOTE LOCATAIRE
    // Si caution 100% rendue → locataire a 4/5 minimum (critères = 1 point max)
    // Formule : 4 + (moyenne_critères / 5) * 1
    if (depositReturned && (!depositReturnedPercent || depositReturnedPercent === 100)) {
      return Math.round((4 + (criteriaAverage / 5) * 1) * 10) / 10
    }

    // Si caution partiellement rendue
    if (depositReturnedPercent && depositReturnedPercent > 0 && depositReturnedPercent < 100) {
      const depositScore = (depositReturnedPercent / 100) * 5
      return Math.round((criteriaAverage * 0.25 + depositScore * 0.75) * 10) / 10
    }

    // Si caution retenue (0%)
    return Math.round((criteriaAverage * 0.25) * 10) / 10
  } else {
    // LOCATAIRE NOTE PROPRIO
    // Si caution 100% reçue → proprio a 3/5 minimum (critères = 2 points max)
    // Formule : 3 + (moyenne_critères / 5) * 2
    if (depositReturned && (!depositReturnedPercent || depositReturnedPercent === 100)) {
      return Math.round((3 + (criteriaAverage / 5) * 2) * 10) / 10
    }

    // Si caution partiellement reçue
    if (depositReturnedPercent && depositReturnedPercent > 0 && depositReturnedPercent < 100) {
      // Bonus proportionnel : de 0 à 3 points selon le % reçu
      const depositBonus = (depositReturnedPercent / 100) * 3
      // Critères : de 0 à 2 points
      const criteriaBonus = (criteriaAverage / 5) * 2
      return Math.round((depositBonus + criteriaBonus) * 10) / 10
    }

    // Si caution non reçue (0%) → que les critères (max 2 points)
    return Math.round((criteriaAverage / 5) * 2 * 10) / 10
  }
}