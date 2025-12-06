import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { awardReviewGivenXP, awardReviewReceivedXP } from '@/lib/xp'

// GET - Récupérer les avis (révélés uniquement)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const leaseId = searchParams.get('leaseId')

    if (!userId && !leaseId) {
      return NextResponse.json(
        { error: 'userId ou leaseId requis' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {
      status: 'REVEALED',
    }

    if (userId) {
      where.targetId = userId
    }

    if (leaseId) {
      where.leaseId = leaseId
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lease: {
          include: {
            property: {
              select: {
                title: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ data: reviews })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    )
  }
}

// POST - Créer un avis
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const {
      leaseId,
      rating,
      criteria,
      comment,
      depositReturned,
      depositReturnedPercent,
    } = await request.json()

    if (!leaseId || !rating || !criteria) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    if (rating < 0 || rating > 5) {
      return NextResponse.json(
        { error: 'Note invalide (0-5)' },
        { status: 400 }
      )
    }

    // Récupérer le bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: { select: { ownerId: true } },
        tenant: { select: { id: true } },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    // Vérifier que le bail est terminé
    if (lease.status !== 'ENDED') {
      return NextResponse.json(
        { error: 'Seuls les baux terminés peuvent être évalués' },
        { status: 400 }
      )
    }

    // Déterminer qui évalue qui
    const isOwner = user.id === lease.property.ownerId
    const isTenant = user.id === lease.tenant.id

    if (!isOwner && !isTenant) {
      return NextResponse.json(
        { error: 'Vous ne faites pas partie de ce bail' },
        { status: 403 }
      )
    }

    const targetId = isOwner ? lease.tenant.id : lease.property.ownerId

    // Vérifier qu'il n'a pas déjà posté un avis
    const existingReview = await prisma.review.findUnique({
      where: {
        leaseId_authorId: {
          leaseId,
          authorId: user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà posté un avis pour ce bail' },
        { status: 400 }
      )
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        leaseId,
        authorId: user.id,
        targetId,
        rating,
        criteria,
        comment: comment || null,
        depositReturned: depositReturned !== undefined ? depositReturned : null,
        depositReturnedPercent: depositReturnedPercent !== undefined ? depositReturnedPercent : null,
        status: 'PENDING',
      },
    })

    // Attribution XP pour avoir donné un avis
    try {
      await awardReviewGivenXP(user.id)

      // Attribution XP pour la personne qui reçoit l'avis (si positif)
      if (rating >= 4.0) {
        await awardReviewReceivedXP(targetId, rating)
      }
    } catch (error) {
      console.error('Erreur attribution XP:', error)
    }

    // Vérifier si l'autre partie a déjà posté son avis
    const otherReview = await prisma.review.findUnique({
      where: {
        leaseId_authorId: {
          leaseId,
          authorId: targetId,
        },
      },
    })

    // Si les deux avis existent, les révéler
    if (otherReview) {
      await prisma.review.updateMany({
        where: {
          leaseId,
          status: 'PENDING',
        },
        data: {
          status: 'REVEALED',
          revealedAt: new Date(),
        },
      })

      return NextResponse.json(
        {
          data: review,
          message: 'Avis soumis et révélé ! Les deux parties ont évalué.',
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        data: review,
        message:
          "Avis soumis ! Il sera révélé une fois que l'autre partie aura également évalué.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'avis" },
      { status: 500 }
    )
  }
}
