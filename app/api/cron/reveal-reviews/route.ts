import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Révéler automatiquement les avis après 14 jours
export async function GET() {
  try {
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    // Trouver les avis en attente depuis plus de 14 jours
    const oldPendingReviews = await prisma.review.findMany({
      where: {
        status: 'PENDING',
        submittedAt: {
          lte: fourteenDaysAgo,
        },
      },
      select: {
        leaseId: true,
      },
      distinct: ['leaseId'],
    })

    // Révéler tous les avis de ces baux
    for (const { leaseId } of oldPendingReviews) {
      await prisma.review.updateMany({
        where: {
          leaseId,
          status: 'PENDING',
        },
        data: {
          status: 'EXPIRED',
          revealedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      revealed: oldPendingReviews.length,
    })
  } catch (error) {
    console.error('Reveal reviews cron error:', error)
    return NextResponse.json(
      { error: 'Erreur cron' },
      { status: 500 }
    )
  }
}