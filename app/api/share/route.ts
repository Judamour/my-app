import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// Générer un code court unique
function generateShortCode(): string {
  return nanoid(8) // 8 caractères aléatoires
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, propertyId } = body

    // Validation
    if (!type || !['PROFILE', 'PROPERTY'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide (PROFILE ou PROPERTY)' },
        { status: 400 }
      )
    }

    // Si c'est un lien de propriété
    if (type === 'PROPERTY') {
      if (!propertyId) {
        return NextResponse.json(
          { error: 'propertyId requis pour un lien de propriété' },
          { status: 400 }
        )
      }

      // Vérifier que la propriété appartient à l'utilisateur
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          ownerId: session.user.id,
        },
      })

      if (!property) {
        return NextResponse.json(
          { error: 'Propriété introuvable ou non autorisée' },
          { status: 404 }
        )
      }

      // Vérifier si un lien existe déjà
      let shareLink = await prisma.shareLink.findFirst({
        where: {
          type: 'PROPERTY',
          propertyId: propertyId,
        },
      })

      // Sinon, créer un nouveau lien
      if (!shareLink) {
        shareLink = await prisma.shareLink.create({
          data: {
            shortCode: generateShortCode(),
            type: 'PROPERTY',
            propertyId: propertyId,
          },
        })
      }

      return NextResponse.json({
        shortCode: shareLink.shortCode,
        url: `/b/${shareLink.shortCode}`,
        fullUrl: `${process.env.NEXTAUTH_URL}/b/${shareLink.shortCode}`,
        views: shareLink.views,
      })
    }

    // Si c'est un lien de profil (passport)
    if (type === 'PROFILE') {
      // Vérifier si un lien existe déjà
      let shareLink = await prisma.shareLink.findFirst({
        where: {
          type: 'PROFILE',
          userId: session.user.id,
        },
      })

      // Sinon, créer un nouveau lien
      if (!shareLink) {
        shareLink = await prisma.shareLink.create({
          data: {
            shortCode: generateShortCode(),
            type: 'PROFILE',
            userId: session.user.id,
          },
        })
      }

      return NextResponse.json({
        shortCode: shareLink.shortCode,
        url: `/p/${shareLink.shortCode}`,
        fullUrl: `${process.env.NEXTAUTH_URL}/p/${shareLink.shortCode}`,
        views: shareLink.views,
      })
    }

  } catch (error) {
    console.error('Share link error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du lien' },
      { status: 500 }
    )
  }
}