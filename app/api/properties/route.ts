import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
/**
 * GET /api/properties
 * Liste toutes les propriétés de l'utilisateur connecté
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    // Vérifier que l'user est propriétaire
    if (!session.user.isOwner) {
      return NextResponse.json(
        { error: 'Vous devez être propriétaire pour accéder à cette ressource' },
        { status: 403 }
      )
    }
    // Récupérer toutes les propriétés de l'owner
    const properties = await prisma.property.findMany({
      where: {
        ownerId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'  // Plus récentes en premier
      },
      include: {
        tenant: {  // Inclure les infos du locataire si présent
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    return NextResponse.json(properties, { status: 200 })
  } catch (error) {
    console.error('GET /api/properties error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des propriétés' },
      { status: 500 }
    )
  }
}
/**
 * POST /api/properties
 * Créer une nouvelle propriété
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    // Vérifier que l'user est propriétaire
    if (!session.user.isOwner) {
      return NextResponse.json(
        { error: 'Vous devez être propriétaire pour créer une propriété' },
        { status: 403 }
      )
    }
    const body = await request.json()
    const { title, address, type, surface, rooms, bedrooms, rent, description } = body
    // Validation des champs obligatoires (accepte 0 pour bedrooms)
    if (!title || !address || !type || surface == null || rooms == null || bedrooms == null || rent == null) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }
    // Validation des types
    if (typeof surface !== 'number' || surface <= 0) {
      return NextResponse.json(
        { error: 'La surface doit être un nombre positif' },
        { status: 400 }
      )
    }
    if (typeof rent !== 'number' || rent <= 0) {
      return NextResponse.json(
        { error: 'Le loyer doit être un nombre positif' },
        { status: 400 }
      )
    }
    // Créer la propriété
    const property = await prisma.property.create({
      data: {
        title,
        address,
        type,
        surface: Number(surface),
        rooms: Number(rooms),
        bedrooms: Number(bedrooms),
        rent: Number(rent),
        description: description || null,
        ownerId: session.user.id,
        available: true  // Par défaut disponible
      }
    })
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('POST /api/properties error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la propriété' },
      { status: 500 }
    )
  }
}
