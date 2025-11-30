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

    // Récupérer la déclaration avec les colocataires
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
            },
            // 🆕 Récupérer tous les colocataires actifs
            tenants: {
              where: { leftAt: null },
              select: {
                tenantId: true,
                joinedAt: true,
              }
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

    // 🆕 Déterminer qui doit recevoir la notification
    const ownerName = `${receipt.lease.property.owner.firstName} ${receipt.lease.property.owner.lastName}`
    const monthName = getMonthName(receipt.month)
    
    // Filtrer les colocataires qui étaient présents ce mois-là
    const eligibleTenants = receipt.lease.tenants.filter(t => {
      const joinedYear = t.joinedAt.getFullYear()
      const joinedMonth = t.joinedAt.getMonth() + 1
      
      if (receipt.year > joinedYear) return true
      if (receipt.year === joinedYear && receipt.month >= joinedMonth) return true
      return false
    })

    // 🆕 Créer une notification pour chaque colocataire éligible
    const notificationPromises = eligibleTenants.map(tenant =>
      prisma.notification.create({
        data: {
          userId: tenant.tenantId,
          type: 'SYSTEM',
          title: '✅ Quittance disponible',
          message: `${ownerName} a confirmé la réception du paiement pour ${monthName} ${receipt.year}. Votre quittance est disponible au téléchargement.`,
          link: '/tenant/receipts'
        }
      })
    )

    await Promise.all(notificationPromises)

    return NextResponse.json({
      data: updatedReceipt,
      message: `Paiement confirmé, ${eligibleTenants.length} locataire(s) notifié(s)`
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