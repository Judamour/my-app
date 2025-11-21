import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Propriétaire confirme le paiement
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

    // Récupérer la déclaration
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        lease: {
          include: {
            property: {
              select: { 
                ownerId: true,
                title: true,
                owner: {
                  select: { firstName: true, lastName: true }
                }
              }
            },
            tenant: {
              select: { id: true, firstName: true }
            }
          }
        }
      }
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Déclaration introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que c'est le propriétaire
    if (receipt.lease.property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier le statut
    if (receipt.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Ce paiement a déjà été confirmé' },
        { status: 400 }
      )
    }

    // Confirmer le paiement
    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        paidAt: new Date()
      }
    })

    // Créer notification pour le locataire
    await prisma.notification.create({
      data: {
        userId: receipt.lease.tenant.id,
        type: 'SYSTEM',
        title: '✅ Paiement confirmé',
        message: `${receipt.lease.property.owner.firstName} ${receipt.lease.property.owner.lastName} a confirmé la réception de votre paiement pour ${getMonthName(receipt.month)} ${receipt.year}. Votre quittance est disponible.`,
        link: '/tenant/receipts'
      }
    })

    return NextResponse.json({
      data: updatedReceipt,
      message: 'Paiement confirmé, quittance générée'
    })

  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation' },
      { status: 500 }
    )
  }
}

function getMonthName(month: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  return months[month - 1]
}