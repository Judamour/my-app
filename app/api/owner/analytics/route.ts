import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Revenus des 6 derniers mois
    const now = new Date()
    const last6Months = []

    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59
      )

      const payments = await prisma.receipt.findMany({
        where: {
          lease: {
            property: { ownerId: session.user.id },
          },
          status: 'CONFIRMED',
          paidAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          totalAmount: true,
        },
      })

      const total = payments.reduce((sum, p) => sum + p.totalAmount, 0)

      last6Months.push({
        month: startOfMonth.toLocaleDateString('fr-FR', { month: 'short' }),
        value: total,
      })
    }

    // Taux d'occupation
    const totalProperties = await prisma.property.count({
      where: { ownerId: session.user.id },
    })

    const occupiedProperties = await prisma.property.count({
      where: {
        ownerId: session.user.id,
        available: false,
      },
    })

    const occupancyRate =
      totalProperties > 0
        ? Math.round((occupiedProperties / totalProperties) * 100)
        : 0

    // Dernières activités
    const recentActivities = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        read: true,
      },
    })

    return NextResponse.json({
      monthlyRevenues: last6Months,
      occupancyRate,
      totalProperties,
      occupiedProperties,
      recentActivities,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    )
  }
}