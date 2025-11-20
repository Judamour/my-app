// types/index.ts
import { Property, User, PropertyType } from '@prisma/client'

// Types composites (Prisma + relations)
export type PropertyWithOwner = Property & {
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
}

export type PropertyWithTenant = Property & {
  tenant: Pick<User, 'id' | 'firstName' | 'lastName'> | null
}

export type PropertyDetail = Property & {
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
  tenant: Pick<User, 'id' | 'firstName' | 'lastName'> | null
}

export type UserProfile = Omit<User, 'password'> & {
  averageRating?: number
  reviewCount?: number
}

// API Response types
export type ApiResponse<T = unknown> = {
  data?: T
  error?: string
  code?: string
  message?: string
}

export type ApiError = {
  error: string
  code: string
  details?: unknown
}

// Pagination
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

// Filters
export type PropertyFilters = {
  city?: string
  minRent?: number
  maxRent?: number
  type?: PropertyType
  minSurface?: number
  minRooms?: number
  minBedrooms?: number
}

// Export Prisma enums
export { PropertyType } from '@prisma/client'
