import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send-email'
import LeaseSignedEmail from '@/emails/templates/LeaseSignedEmail'

// POST - Créer un bail
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
    if (application.property.ownerId !== session.user.id) {
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

// Créer le bail avec les relations
const lease = await prisma.lease.create({
  data: {
    propertyId: application.propertyId,
    tenantId: application.tenantId,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    monthlyRent: rentAmount,
    deposit: depositAmount || rentAmount,
    status: 'PENDING',
  },
 include: {
    property: {
      include: {
        owner: true,  // ✅ owner est dans property
      },
    },
    tenant: true,
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

    // ✅ NOUVEAU : Envoyer les emails (owner + tenant)
try {
  // Email au propriétaire
  await sendEmail({
    to: lease.property.owner.email,
    subject: `📝 Bail signé pour ${lease.property.title}`,
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
    subject: `📝 Votre bail a été signé !`,
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
  { data: lease },
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

// GET - Récupérer les baux
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
    const role = searchParams.get('role')

    if (role === 'owner') {
      // Baux de mes propriétés
      const leases = await prisma.lease.findMany({
        where: {
          property: {
            ownerId: session.user.id
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
          tenantId: session.user.id
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