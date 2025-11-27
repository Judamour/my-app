import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send-email'
import PaymentReceivedEmail from '@/emails/templates/PaymentReceivedEmail'

// POST - Locataire déclare avoir payé
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
    const { leaseId, month, year, paymentMethod } = body

    // Validation
    if (!leaseId || !month || !year) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que c'est un mois passé ou en cours
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas déclarer un paiement pour un mois futur' },
        { status: 400 }
      )
    }

    // Vérifier le bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: {
          select: { 
            ownerId: true,
            title: true,
            owner: {
              select: { id: true, firstName: true }
            }
          }
        },
        tenant: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que c'est le locataire
    if (lease.tenantId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier qu'une déclaration n'existe pas déjà
    const existing = await prisma.receipt.findFirst({
      where: { leaseId, month, year }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un paiement a déjà été déclaré pour ce mois' },
        { status: 400 }
      )
    }

    // Calculer le total
    const totalAmount = lease.monthlyRent + (lease.charges || 0)

    // Créer la déclaration de paiement
    const receipt = await prisma.receipt.create({
      data: {
        leaseId,
        month,
        year,
        rentAmount: lease.monthlyRent,
        charges: lease.charges || 0,
        totalAmount,
        status: 'DECLARED',
        declaredAt: new Date(),
        paymentMethod: paymentMethod || 'virement',
      }
    })

    // Créer notification pour le propriétaire
    await prisma.notification.create({
      data: {
        userId: lease.property.ownerId,
        type: 'SYSTEM',
        title: '💰 Paiement déclaré',
        message: `${lease.tenant.firstName} ${lease.tenant.lastName} déclare avoir payé le loyer de ${getMonthName(month)} ${year} pour ${lease.property.title}.`,
        link: '/owner/receipts?pending=true'
      }
    })

// ✅ NOUVEAU : Envoyer l'email au propriétaire
try {
  // Récupérer l'email du propriétaire
  const owner = await prisma.user.findUnique({
    where: { id: lease.property.ownerId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
    },
  })

  if (owner) {
    await sendEmail({
      to: owner.email,
      subject: `💰 Paiement reçu - ${lease.property.title}`,
      react: PaymentReceivedEmail({
        ownerName: `${owner.firstName} ${owner.lastName}`,
        tenantName: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
        propertyTitle: lease.property.title,
        amount: totalAmount,
        paymentDate: new Date().toLocaleDateString('fr-FR'),
        paymentMonth: `${getMonthName(month)} ${year}`,
        paymentsUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/owner/receipts?pending=true`,
      }),
    })
    console.log(`✅ Payment notification sent to owner: ${owner.email}`)
  }
} catch (emailError) {
  console.error('⚠️ Email sending failed:', emailError)
}


    return NextResponse.json(
      { data: receipt, message: 'Paiement déclaré' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Declare payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la déclaration' },
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