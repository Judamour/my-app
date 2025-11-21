import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Créer une quittance
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
    const { leaseId, month, year, rentAmount, charges, paymentMethod } = body

    // Validation
    if (!leaseId || !month || !year || !rentAmount) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier le bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: {
          select: { ownerId: true }
        }
      }
    })

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que c'est le propriétaire
    if (lease.property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier qu'une quittance n'existe pas déjà
    const existing = await prisma.receipt.findFirst({
      where: { leaseId, month, year }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Une quittance existe déjà pour ce mois' },
        { status: 400 }
      )
    }

    // Calculer le total
    const totalAmount = rentAmount + (charges || 0)

    // Créer la quittance
    const receipt = await prisma.receipt.create({
      data: {
        leaseId,
        month,
        year,
        rentAmount,
        charges: charges || 0,
        totalAmount,
        paidAt: new Date(),
        paymentMethod: paymentMethod || 'virement',
      }
    })

    return NextResponse.json(
      { data: receipt },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create receipt error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les quittances
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
    const leaseId = searchParams.get('leaseId')
    const role = searchParams.get('role')

    if (leaseId) {
      // Quittances d'un bail spécifique
      const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
          property: { select: { ownerId: true } }
        }
      })

      if (!lease) {
        return NextResponse.json(
          { error: 'Bail introuvable' },
          { status: 404 }
        )
      }

      // Vérifier accès
      const isOwner = lease.property.ownerId === session.user.id
      const isTenant = lease.tenantId === session.user.id

      if (!isOwner && !isTenant) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        )
      }

      const receipts = await prisma.receipt.findMany({
        where: { leaseId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
      })

      return NextResponse.json({ data: receipts })
    }

    // Toutes les quittances selon le rôle
    if (role === 'owner') {
      const receipts = await prisma.receipt.findMany({
        where: {
          lease: {
            property: { ownerId: session.user.id }
          }
        },
        include: {
          lease: {
            include: {
              property: { select: { title: true } },
              tenant: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
      })

      return NextResponse.json({ data: receipts })
    } else {
      const receipts = await prisma.receipt.findMany({
        where: {
          lease: { tenantId: session.user.id }
        },
        include: {
          lease: {
            include: {
              property: { select: { title: true, address: true, city: true } }
            }
          }
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
      })

      return NextResponse.json({ data: receipts })
    }

  } catch (error) {
    console.error('Get receipts error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}