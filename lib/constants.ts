// lib/constants.ts

// Delays & intervals
export const REVIEW_REVEAL_DELAY_DAYS = 14
export const MESSAGE_POLLING_INTERVAL_MS = 5000
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 jours

// Limits
export const MAX_IMAGES_PER_PROPERTY = 10
export const MAX_MESSAGE_LENGTH = 5000
export const MAX_REVIEW_COMMENT_LENGTH = 1000
export const MIN_PASSWORD_LENGTH = 8
export const MAX_FILE_SIZE_MB = 10

// Rentals
export const MIN_RENT = 30
export const MAX_RENT = 50000
export const MIN_SURFACE = 1
export const MAX_SURFACE = 10000

// Ratings
export const MIN_RATING = 1
export const MAX_RATING = 5
export const DEPOSIT_RETURN_BONUS_WEIGHT = 2 // Coefficient bonus caution

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Labels
export const PROPERTY_TYPE_LABELS = {
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  STUDIO: 'Studio',
  ROOM: 'Chambre',
  PARKING: 'Parking',
  OFFICE: 'Bureau',
} as const

export const LEASE_STATUS_LABELS = {
  PENDING: 'En attente',
  ACTIVE: 'Active',
  ENDED: 'Terminée',
  CANCELLED: 'Annulée',
} as const

export const APPLICATION_STATUS_LABELS = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  
  // Owner
  OWNER_DASHBOARD: '/owner',
  OWNER_PROPERTIES: '/owner/properties',
  OWNER_PROPERTY_NEW: '/owner/properties/new',
  OWNER_PROPERTY_EDIT: (id: string) => `/owner/properties/${id}/edit`,
  
  // Tenant
  TENANT_DASHBOARD: '/tenant',
  TENANT_SEARCH: '/search',
  TENANT_APPLICATIONS: '/tenant/applications',
  
  // Common
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  PROFILE: (userId: string) => `/profile/${userId}`,
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_MODERATION: '/admin/moderation',
} as const