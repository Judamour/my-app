import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send-email'
import ReceiptGeneratedEmail from '@/emails/templates/ReceiptGeneratedEmail'

// POST - Propriétaire confirme directement un paiement
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
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
          select: { 
            ownerId: true,
            title: true,
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

    // Vérifier que c'est le propriétaire
    if (lease.property.ownerId !== user.id) {
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

    // Créer la quittance directement confirmée
    const receipt = await prisma.receipt.create({
      data: {
        leaseId,
        month,
        year,
        rentAmount,
        charges: charges || 0,
        totalAmount,
        status: 'CONFIRMED',
        paidAt: new Date(),
        paymentMethod: paymentMethod || 'virement',
      }
    })

    // Notifier le locataire
    await prisma.notification.create({
      data: {
        userId: lease.tenant.id,
        type: 'SYSTEM',
        title: '🧾 Quittance disponible',
        message: `Votre quittance de loyer pour ${getMonthName(month)} ${year} (${lease.property.title}) est disponible.`,
        link: '/tenant/receipts'
      }
    })


    // ✅ NOUVEAU : Envoyer l'email au locataire
try {
  // Récupérer l'email du locataire
  const tenant = await prisma.user.findUnique({
    where: { id: lease.tenant.id },
    select: {
      email: true,
      firstName: true,
      lastName: true,
    },
  })

  if (tenant) {
    await sendEmail({
      to: tenant.email,
      subject: `🧾 Quittance de loyer - ${getMonthName(month)} ${year}`,
      react: ReceiptGeneratedEmail({
        tenantName: `${tenant.firstName} ${tenant.lastName}`,
        propertyTitle: lease.property.title,
        amount: totalAmount,
        paymentMonth: `${getMonthName(month)} ${year}`,
        receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant/receipts`,
      }),
    })
    console.log(`✅ Receipt notification sent to tenant: ${tenant.email}`)
  }
} catch (emailError) {
  console.error('⚠️ Email sending failed:', emailError)
}

    return NextResponse.json(
      { data: receipt, message: 'Quittance générée' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Owner confirm payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
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