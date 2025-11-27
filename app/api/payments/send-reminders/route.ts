import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send-email'
import PaymentReminderEmail from '@/emails/templates/PaymentReminderEmail'

// POST - Envoyer des rappels pour loyers impayés
export async function POST(request: Request) {
  try {
    const session = await auth()

    // Vérifier que c'est un appel Vercel Cron OU un admin
    const authHeader = request.headers.get('authorization')
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
    const isAdmin = session?.user?.role === 'ADMIN'

    if (!isVercelCron && !isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Trouver tous les baux actifs
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        property: {
          select: {
            title: true,
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    let remindersSent = 0

    // Pour chaque bail, vérifier si paiement du mois en cours existe
    for (const lease of activeLeases) {
      // Chercher quittance du mois en cours
      const currentMonthReceipt = await prisma.receipt.findFirst({
        where: {
          leaseId: lease.id,
          month: currentMonth,
          year: currentYear,
        },
      })

      // Si pas de quittance et on est après le 5 du mois → envoyer rappel
      if (!currentMonthReceipt && now.getDate() >= 5) {
        const daysOverdue = now.getDate() - 1 // Loyer dû le 1er

        try {
          await sendEmail({
            to: lease.tenant.email,
            subject: `⚠️ Rappel : Loyer impayé - ${lease.property.title}`,
            react: PaymentReminderEmail({
              tenantName: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
              propertyTitle: lease.property.title,
              amount: lease.monthlyRent + (lease.charges || 0),
              dueDate: `01/${currentMonth.toString().padStart(2, '0')}/${currentYear}`,
              daysOverdue,
              paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant/payments`,
            }),
          })

          remindersSent++
          console.log(`✅ Reminder sent to: ${lease.tenant.email}`)
        } catch (emailError) {
          console.error(`⚠️ Failed to send reminder to ${lease.tenant.email}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      message: `${remindersSent} rappel(s) envoyé(s)`,
      remindersSent,
    })
  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des rappels' },
      { status: 500 }
    )
  }
}