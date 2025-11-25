export type BadgeCategory = 'PROFILE' | 'RELIABILITY' | 'SOCIAL' | 'PERFORMANCE' | 'SPECIAL'
export type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: BadgeRarity
  condition: string
  points: number
}

export interface UserBadge {
  badgeId: string
  unlockedAt: Date
}