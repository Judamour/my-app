// lib/validations/property.ts
import { z } from 'zod'
import { MIN_RENT, MAX_RENT, MIN_SURFACE, MAX_SURFACE } from '@/lib/constants'

export const createPropertySchema = z.object({
  title: z
    .string()
    .min(5, 'Titre trop court (min 5 caractères)')
    .max(100, 'Titre trop long (max 100 caractères)'),
  address: z.string().min(5, 'Adresse trop courte (min 5 caractères)'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  type: z.enum([
    'APARTMENT',
    'HOUSE', 
    'STUDIO',
    'ROOM',
    'PARKING',
    'OFFICE',
    'SHOP',      // ✅ Ajouté
    'LAND',      // ✅ Ajouté
    'WAREHOUSE', // ✅ Ajouté
    'GARAGE',    // ✅ Ajouté
  ]),
  surface: z
    .number()
    .positive('La surface doit être positive')
    .min(MIN_SURFACE, `Surface minimum : ${MIN_SURFACE}m²`)
    .max(MAX_SURFACE, `Surface maximum : ${MAX_SURFACE}m²`),
  rooms: z
    .number()
    .int()
    .min(0, 'Minimum 0 pièce') // ✅ Changé de 1 à 0 pour parking/garage/etc
    .max(20, 'Maximum 20 pièces'),
  bedrooms: z
    .number()
    .int()
    .min(0, 'Minimum 0 chambre')
    .max(15, 'Maximum 15 chambres'),
  rent: z
    .number()
    .positive('Le loyer doit être positif')
    .min(MIN_RENT, `Loyer minimum : ${MIN_RENT}€`)
    .max(MAX_RENT, `Loyer maximum : ${MAX_RENT}€`),
  description: z
    .string()
    .max(2000, 'Description trop longue (max 2000 caractères)')
    .optional()
    .nullable(),
  images: z.array(z.string().url()).default([]),
})

export const updatePropertySchema = createPropertySchema.extend({
  available: z.boolean().optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>