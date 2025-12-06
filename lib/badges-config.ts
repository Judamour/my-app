import { Badge, BadgeCategory, BadgeRarity } from '../types/badge'

// 🎯 LISTE DE TOUS LES BADGES DISPONIBLES
export const ALL_BADGES: Badge[] = [
  // ==================== PROFIL ====================
  {
    id: 'first-steps',
    name: 'Premier pas',
    description: 'Profil complété',
    icon: '🌟',
    category: 'PROFILE',
    rarity: 'COMMON',
    condition: 'Compléter son profil',
    points: 50,
  },
  {
    id: 'communicator',
    name: 'Communicant',
    description: 'Téléphone renseigné',
    icon: '📞',
    category: 'PROFILE',
    rarity: 'COMMON',
    condition: 'Ajouter un numéro de téléphone',
    points: 25,
  },
  {
    id: 'complete-profile',
    name: 'Perfectionniste',
    description: 'Tous les champs du profil remplis',
    icon: '🎯',
    category: 'PROFILE',
    rarity: 'RARE',
    condition: 'Remplir 100% du profil',
    points: 100,
  },

  // ==================== LOCATAIRES - FIABILITÉ ====================
  {
    id: 'loyal-tenant',
    name: 'Locataire fidèle',
    description: 'Au moins 1 bail terminé',
    icon: '🏡',
    category: 'RELIABILITY',
    rarity: 'COMMON',
    condition: 'Terminer 1 bail',
    points: 100,
  },
  {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Membre depuis 1 an+',
    icon: '🎖️',
    category: 'RELIABILITY',
    rarity: 'RARE',
    condition: 'Être inscrit depuis 12 mois',
    points: 200,
  },
  {
    id: 'super-tenant',
    name: 'Super locataire',
    description: 'Note moyenne ≥ 4.5/5',
    icon: '🏆',
    category: 'PERFORMANCE',
    rarity: 'EPIC',
    condition: 'Obtenir une note moyenne de 4.5 ou plus',
    points: 300,
  },
  {
    id: 'flawless',
    name: 'Impeccable',
    description: '100% caution restituée (3+ baux)',
    icon: '💎',
    category: 'PERFORMANCE',
    rarity: 'LEGENDARY',
    condition: 'Récupérer 100% de sa caution sur 3 baux ou plus',
    points: 500,
  },
  {
    id: 'five-stars',
    name: '5 étoiles',
    description: '5 avis avec note ≥ 4.5',
    icon: '⭐',
    category: 'PERFORMANCE',
    rarity: 'EPIC',
    condition: 'Recevoir 5 avis avec une note de 4.5 ou plus',
    points: 250,
  },

  // ==================== PAIEMENTS ====================
  {
    id: 'punctual',
    name: 'Ponctuel',
    description: '3+ paiements confirmés',
    icon: '⏰',
    category: 'RELIABILITY',
    rarity: 'COMMON',
    condition: 'Effectuer 3 paiements confirmés',
    points: 75,
  },
  {
    id: 'perfect-streak',
    name: 'Série parfaite',
    description: "5 paiements consécutifs à l'heure",
    icon: '🔥',
    category: 'PERFORMANCE',
    rarity: 'RARE',
    condition: 'Payer 5 loyers consécutifs sans retard',
    points: 200,
  },
  {
    id: 'always-on-time',
    name: "Toujours à l'heure",
    description: '0 retard sur 12 mois',
    icon: '📅',
    category: 'PERFORMANCE',
    rarity: 'EPIC',
    condition: 'Aucun retard de paiement pendant 12 mois',
    points: 400,
  },

  // ==================== SOCIAL ====================
  {
    id: 'chatty',
    name: 'Bavard',
    description: '10+ messages envoyés',
    icon: '🤝',
    category: 'SOCIAL',
    rarity: 'COMMON',
    condition: 'Envoyer 10 messages',
    points: 50,
  },
  {
    id: 'social-butterfly',
    name: 'Papillon social',
    description: '50+ messages envoyés',
    icon: '🦋',
    category: 'SOCIAL',
    rarity: 'RARE',
    condition: 'Envoyer 50 messages',
    points: 150,
  },

  // ==================== PROPRIÉTAIRES ====================
  {
    id: 'landlord-pro',
    name: 'Proprio pro',
    description: '3+ propriétés actives',
    icon: '🏠',
    category: 'PERFORMANCE',
    rarity: 'RARE',
    condition: 'Avoir 3 propriétés actives simultanément',
    points: 200,
  },
  {
    id: 'investor',
    name: 'Investisseur',
    description: '5+ propriétés au total',
    icon: '💼',
    category: 'PERFORMANCE',
    rarity: 'EPIC',
    condition: 'Créer 5 propriétés ou plus',
    points: 300,
  },
  {
    id: 'five-star-host',
    name: 'Hôte 5 étoiles',
    description: 'Note moyenne ≥ 4.5/5',
    icon: '🌟',
    category: 'PERFORMANCE',
    rarity: 'EPIC',
    condition: 'Obtenir une note moyenne de 4.5 ou plus',
    points: 300,
  },
  {
    id: 'responsive',
    name: 'Réactif',
    description: 'Répond en moins de 2h en moyenne',
    icon: '🚀',
    category: 'PERFORMANCE',
    rarity: 'RARE',
    condition: 'Temps de réponse moyen inférieur à 2 heures',
    points: 150,
  },

  // ==================== SPÉCIAUX ====================
  {
    id: 'early-adopter',
    name: 'Pionnier',
    description: 'Bienvenue sur Renty !',
    icon: '🚀',
    category: 'SPECIAL',
    rarity: 'COMMON',
    condition: 'Créer un compte sur Renty',
    points: 500,
  },
]

// Fonction helper pour récupérer un badge par son ID
export function getBadgeById(badgeId: string): Badge | undefined {
  return ALL_BADGES.find(badge => badge.id === badgeId)
}

// Fonction helper pour récupérer badges par catégorie
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter(badge => badge.category === category)
}

// Fonction helper pour récupérer badges par rareté
export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return ALL_BADGES.filter(badge => badge.rarity === rarity)
}
