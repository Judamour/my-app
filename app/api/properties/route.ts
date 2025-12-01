// app/api/properties/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPropertySchema } from '@/lib/validations/property'
import { UnauthorizedError, ForbiddenError, handleApiError } from '@/lib/errors'
import type { ApiResponse, PropertyWithTenant } from '@/types'
import { awardPropertyCreationXP } from '@/lib/xp'
import { checkSubscriptionStatus } from '@/lib/subscription'
import { PRICING_PLANS } from '@/lib/pricing'
/**
 * GET /api/properties
 * Liste toutes les propriétés de l'utilisateur connecté
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      throw new UnauthorizedError()
    }

    if (!session.user.isOwner) {
      throw new ForbiddenError(
        'Vous devez être propriétaire pour accéder à cette ressource'
      )
    }

    // Récupérer toutes les propriétés de l'owner
    const properties: PropertyWithTenant[] = await prisma.property.findMany({
      where: {
        ownerId: session.user.id,
          deletedAt: null, 
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    const response: ApiResponse<PropertyWithTenant[]> = {
      data: properties,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/properties
 * Créer une nouvelle propriété
 */
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

      // ✅ NOUVEAU : Vérifier le statut d'abonnement
    const subscriptionStatus = await checkSubscriptionStatus(session.user.id)

    if (!subscriptionStatus.canAddProperty) {
      const planConfig = PRICING_PLANS[subscriptionStatus.plan]
      
      return NextResponse.json(
        {
          error: 'Limite de propriétés atteinte',
          message: `Votre plan ${planConfig.name} est limité à ${planConfig.maxProperties} propriétés. Veuillez upgrader votre abonnement.`,
          currentCount: subscriptionStatus.currentCount,
          maxProperties: subscriptionStatus.maxProperties,
          requiresUpgrade: true,
          nextPlan: subscriptionStatus.nextPlan,
        },
        { status: 403 }
      )
    }


    // Vérifier isOwner depuis DB (pas session)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOwner: true },
    })

    if (!user?.isOwner) {
      throw new ForbiddenError(
        'Vous devez être propriétaire pour créer une propriété'
      )
    }

    const body = await req.json()

    // ✅ Validation automatique avec Zod
    const validatedData = createPropertySchema.parse(body)

    // Créer la propriété
    const property = await prisma.property.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        available: true,
      },
    })

    // Attribution XP pour création de propriété
try {
  await awardPropertyCreationXP(session.user.id)
} catch (error) {
  console.error('Erreur attribution XP:', error)
  // Ne pas bloquer la création même si XP échoue
}

return NextResponse.json(property, { status: 201 })

    const response: ApiResponse = {
      data: property,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
