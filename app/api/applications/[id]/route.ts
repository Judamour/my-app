import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardApplicationAcceptedXP } from '@/lib/xp'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Accepter ou refuser une candidature
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide (ACCEPTED ou REJECTED)' },
        { status: 400 }
      )
    }

    // Récupérer la candidature avec la propriété
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            ownerId: true,
            title: true,
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que c'est bien le propriétaire qui fait l'action
    if (application.property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier que la candidature est en attente
    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette candidature a déjà été traitée' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status }
    })

    // ✅ ATTRIBUTION XP - AVANT LE RETURN !
    if (status === 'ACCEPTED' && application.tenantId) {
      try {
        await awardApplicationAcceptedXP(application.tenantId)
      } catch (error) {
        console.error('Erreur attribution XP:', error)
        // Ne pas bloquer la réponse même si XP échoue
      }
    }

    // Retourner la réponse
    return NextResponse.json({
      data: updatedApplication,
      message: status === 'ACCEPTED' ? 'Candidature acceptée' : 'Candidature refusée'
    })

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// GET - Récupérer une candidature spécifique
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            postalCode: true,
            rent: true,
            ownerId: true,
          }
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileComplete: true,
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      )
    }

    // Vérifier accès : soit le propriétaire, soit le locataire
    const isOwner = application.property.ownerId === session.user.id
    const isTenant = application.tenantId === session.user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Si c'est le locataire et que la candidature n'est pas acceptée, masquer l'adresse
    if (isTenant && application.status !== 'ACCEPTED') {
      application.property.address = '***'
    }

    return NextResponse.json({ data: application })

  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}