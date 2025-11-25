// Types de catégories de badges
export type BadgeCategory = 
  | 'PROFILE'      // Badges liés au profil
  | 'RELIABILITY'  // Badges de fiabilité
  | 'SOCIAL'       // Badges sociaux
  | 'PERFORMANCE'  // Badges de performance
  | 'SPECIAL'      // Badges spéciaux/rares

// Niveaux de rareté
export type BadgeRarity = 
  | 'COMMON'       // Facile à obtenir
  | 'RARE'         // Moyen
  | 'EPIC'         // Difficile
  | 'LEGENDARY'    // Très difficile

// Interface d'un badge
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: BadgeRarity
  condition: string // Description de comment l'obtenir
  points: number    // Points XP gagnés
}

// Interface pour le badge d'un utilisateur (avec date de déblocage)
export interface UserBadge {
  badgeId: string
  unlockedAt: Date
}