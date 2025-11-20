import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Créer une candidature
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est locataire
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isTenant: true }
    })

    if (!user?.isTenant) {
      return NextResponse.json(
        { error: 'Vous devez être locataire pour postuler' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { propertyId, message } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId requis' },
        { status: 400 }
      )
    }

    // Vérifier que la propriété existe et est disponible
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, available: true, ownerId: true }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propriété introuvable' },
        { status: 404 }
      )
    }

    if (!property.available) {
      return NextResponse.json(
        { error: 'Ce bien n\'est plus disponible' },
        { status: 400 }
      )
    }

    // Vérifier qu'on ne postule pas à son propre bien
    if (property.ownerId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas postuler à votre propre bien' },
        { status: 400 }
      )
    }

    // Vérifier qu'on n'a pas déjà postulé
    const existingApplication = await prisma.application.findFirst({
      where: {
        propertyId,
        tenantId: session.user.id,
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Vous avez déjà postulé à ce bien' },
        { status: 400 }
      )
    }

    // Créer la candidature
    const application = await prisma.application.create({
      data: {
        propertyId,
        tenantId: session.user.id,
        message: message || null,
        status: 'PENDING',
      }
    })

    return NextResponse.json(
      { data: application },
      { status: 201 }
    )

  } catch (error) {
    console.error('Application error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la candidature' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les candidatures
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'owner' ou 'tenant'

    if (role === 'owner') {
      // Candidatures reçues (pour mes biens)
      const applications = await prisma.application.findMany({
        where: {
          property: {
            ownerId: session.user.id
          }
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              rent: true,
            }
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileComplete: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ data: applications })

    } else {
      // Mes candidatures envoyées
      const applications = await prisma.application.findMany({
        where: {
          tenantId: session.user.id
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              postalCode: true,
              rent: true,
              images: true,
              owner: {
                select: {
                  firstName: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ data: applications })
    }

  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des candidatures' },
      { status: 500 }
    )
  }
}