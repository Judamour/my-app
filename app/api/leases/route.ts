import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send-email'
import LeaseSignedEmail from '@/emails/templates/LeaseSignedEmail'

// POST - Créer un bail
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
    const { applicationId, startDate, endDate, rentAmount, depositAmount } = body

    // Validation
    if (!applicationId || !startDate || !rentAmount) {
      return NextResponse.json(
        { error: 'Données manquantes (applicationId, startDate, rentAmount requis)' },
        { status: 400 }
      )
    }

    // Récupérer la candidature
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        property: {
          select: {
            id: true,
            ownerId: true,
            title: true,
            rent: true,
            address: true,
            postalCode: true,
            city: true,
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

    // Vérifier que c'est le propriétaire
    if (application.property.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier que la candidature est acceptée
    if (application.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'La candidature doit être acceptée pour créer un bail' },
        { status: 400 }
      )
    }

    // Vérifier qu'un bail n'existe pas déjà
    const existingLease = await prisma.lease.findFirst({
      where: {
        propertyId: application.propertyId,
        tenantId: application.tenantId,
        status: { in: ['ACTIVE', 'PENDING'] }
      }
    })

    if (existingLease) {
      return NextResponse.json(
        { error: 'Un bail existe déjà pour ce locataire et ce bien' },
        { status: 400 }
      )
    }

    // 🆕 Vérifier si le bail est rétroactif (date passée)
    const leaseStartDate = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const isRetroactive = leaseStartDate < today
    const leaseStatus = isRetroactive ? 'ACTIVE' : 'PENDING'

    // Créer le bail
    const lease = await prisma.lease.create({
      data: {
        propertyId: application.propertyId,
        tenantId: application.tenantId,
        startDate: leaseStartDate,
        endDate: endDate ? new Date(endDate) : null,
        monthlyRent: rentAmount,
        deposit: depositAmount || rentAmount,
        status: leaseStatus,
      },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
        tenant: true,
      },
    })

    // 🆕 Créer l'entrée LeaseTenant pour le tenant principal
await prisma.leaseTenant.create({
  data: {
    leaseId: lease.id,
    tenantId: application.tenantId,
    isPrimary: true,
    share: 100,
    joinedAt: leaseStartDate,
  },
})



    // Mettre à jour la propriété comme non disponible
    await prisma.property.update({
      where: { id: application.propertyId },
      data: { 
        available: false,
        tenantId: application.tenantId
      }
    })

    // 🆕 Générer les quittances passées si bail rétroactif
    let receiptsGenerated = 0
    
    if (isRetroactive) {
      receiptsGenerated = await generatePastReceipts(lease.id, leaseStartDate, rentAmount)
      
      // Notification services pour le locataire (bail rétroactif = déjà installé)
      await prisma.notification.create({
        data: {
          userId: lease.tenantId,
          type: 'SYSTEM',
          title: '🏠 Bienvenue sur la plateforme !',
          message: `Votre bail pour "${lease.property.title}" a été enregistré. Vos ${receiptsGenerated} quittances passées sont disponibles. N'oubliez pas de configurer vos services essentiels.`,
          link: '/tenant/services',
        },
      })
    }

    // Envoyer les emails
    try {
      // Email au propriétaire
      await sendEmail({
        to: lease.property.owner.email,
        subject: `📝 Bail ${isRetroactive ? 'enregistré' : 'créé'} pour ${lease.property.title}`,
        react: LeaseSignedEmail({
          recipientName: `${lease.property.owner.firstName} ${lease.property.owner.lastName}`,
          recipientRole: 'owner',
          propertyTitle: lease.property.title,
          propertyAddress: `${lease.property.address}, ${lease.property.postalCode} ${lease.property.city}`,
          startDate: lease.startDate.toLocaleDateString('fr-FR'),
          endDate: lease.endDate ? lease.endDate.toLocaleDateString('fr-FR') : 'Indéterminée',
          monthlyRent: lease.monthlyRent,
          leaseUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/owner/leases`,
        }),
      })

      // Email au locataire
      await sendEmail({
        to: lease.tenant.email,
        subject: `📝 Votre bail a été ${isRetroactive ? 'enregistré' : 'créé'} !`,
        react: LeaseSignedEmail({
          recipientName: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
          recipientRole: 'tenant',
          propertyTitle: lease.property.title,
          propertyAddress: `${lease.property.address}, ${lease.property.postalCode} ${lease.property.city}`,
          startDate: lease.startDate.toLocaleDateString('fr-FR'),
          endDate: lease.endDate ? lease.endDate.toLocaleDateString('fr-FR') : 'Indéterminée',
          monthlyRent: lease.monthlyRent,
          leaseUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant/leases`,
        }),
      })

      console.log('✅ Lease notifications sent to both parties')
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError)
    }

    return NextResponse.json(
      { 
        data: lease,
        receiptsGenerated,
        isRetroactive,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create lease error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du bail' },
      { status: 500 }
    )
  }
}

// 🆕 Fonction pour générer les quittances passées
async function generatePastReceipts(leaseId: string, startDate: Date, monthlyRent: number): Promise<number> {
  const receipts = []
  const now = new Date()
  
  // Commencer au premier jour du mois de début
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  
  while (currentDate <= now) {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1 // 1-12
    
    // Date de paiement (5 du mois pour les quittances passées)
    const paidAt = new Date(year, month - 1, 5)
    
    receipts.push({
      leaseId,
      month,
      year,
      rentAmount: monthlyRent,
      charges: 0,
      totalAmount: monthlyRent,
      status: 'CONFIRMED' as const,
      declaredAt: paidAt,
      paidAt,
    })
    
    // Passer au mois suivant
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  
  // Créer toutes les quittances en une seule requête
  if (receipts.length > 0) {
    await prisma.receipt.createMany({
      data: receipts,
    })
  }
  
  return receipts.length
}

// GET - Récupérer les baux
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    if (role === 'owner') {
      // Baux de mes propriétés
      const leases = await prisma.lease.findMany({
        where: {
          property: {
            ownerId: user.id
          }
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
            }
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ data: leases })

    } else {
      // Mes baux en tant que locataire
      const leases = await prisma.lease.findMany({
        where: {
          tenantId: user.id
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ data: leases })
    }

  } catch (error) {
    console.error('Get leases error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des baux' },
      { status: 500 }
    )
  }
}