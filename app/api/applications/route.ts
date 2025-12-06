import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { awardApplicationSubmissionXP } from '@/lib/xp'
import { sendEmail } from '@/lib/email/send-email'
import NewApplicationEmail from '@/emails/templates/NewApplicationEmail'

// POST - Créer une candidature
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est locataire
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isTenant: true },
    })

    if (!dbUser?.isTenant) {
      return NextResponse.json(
        { error: 'Vous devez être locataire pour postuler' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { propertyId, message, sharedDocumentIds } = body // 🆕 Ajout sharedDocumentIds

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId requis' }, { status: 400 })
    }

    // Vérifier que la propriété existe et est disponible
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, available: true, ownerId: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propriété introuvable' },
        { status: 404 }
      )
    }

    if (!property.available) {
      return NextResponse.json(
        { error: "Ce bien n'est plus disponible" },
        { status: 400 }
      )
    }

    // Vérifier qu'on ne postule pas à son propre bien
    if (property.ownerId === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas postuler à votre propre bien' },
        { status: 400 }
      )
    }

    // 🆕 Vérifier cooldown après annulation (7 jours)
    const COOLDOWN_DAYS = 7
    const cooldownDate = new Date()
    cooldownDate.setDate(cooldownDate.getDate() - COOLDOWN_DAYS)

    const cancelledApplication = await prisma.application.findFirst({
      where: {
        propertyId,
        tenantId: user.id,
        status: 'CANCELLED',
        updatedAt: { gte: cooldownDate },
      },
    })

    if (cancelledApplication) {
      const daysSinceCancelled = Math.ceil(
        (Date.now() - new Date(cancelledApplication.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const daysRemaining = COOLDOWN_DAYS - daysSinceCancelled

      return NextResponse.json(
        {
          error: `Vous avez annulé votre candidature récemment. Veuillez patienter ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} avant de repostuler.`,
        },
        { status: 400 }
      )
    }

    // Vérifier si une candidature active existe (PENDING ou ACCEPTED)
    const existingApplication = await prisma.application.findFirst({
      where: {
        propertyId,
        tenantId: user.id,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      include: {
        property: {
          select: {
            leases: {
              where: { tenantId: user.id },
              select: { status: true },
            },
          },
        },
      },
    })

    if (existingApplication) {
      // Vérifier si tous les baux sont terminés (permet de repostuler)
      const hasActiveLease = existingApplication.property.leases.some(
        lease => lease.status !== 'ENDED'
      )

      // Si un bail actif/pending existe, ou si pas de bail du tout (candidature en cours)
      if (hasActiveLease || existingApplication.property.leases.length === 0) {
        return NextResponse.json(
          { error: 'Vous avez déjà postulé pour ce bien' },
          { status: 400 }
        )
      }

      // Si le bail est terminé, supprimer l'ancienne candidature pour permettre une nouvelle
      await prisma.application.delete({
        where: { id: existingApplication.id },
      })
    }

    // 🆕 Vérifier que les documents appartiennent bien à l'utilisateur
    if (sharedDocumentIds && sharedDocumentIds.length > 0) {
      const validDocuments = await prisma.document.findMany({
        where: {
          id: { in: sharedDocumentIds },
          ownerId: user.id,
        },
        select: { id: true },
      })

      const validIds = validDocuments.map(d => d.id)
      const invalidIds = sharedDocumentIds.filter(
        (id: string) => !validIds.includes(id)
      )

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: 'Certains documents ne vous appartiennent pas' },
          { status: 400 }
        )
      }
    }

    // Créer la candidature avec les documents partagés
    const application = await prisma.application.create({
      data: {
        propertyId,
        tenantId: user.id,
        message: message || null,
        status: 'PENDING',
        // 🆕 Créer les liens vers les documents partagés
        sharedDocuments: {
          create: (sharedDocumentIds || []).map((documentId: string) => ({
            documentId,
          })),
        },
      },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
        tenant: true,
        // 🆕 Inclure les documents partagés dans la réponse
        sharedDocuments: {
          include: {
            document: {
              select: {
                id: true,
                type: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Attribution XP pour candidature soumise
    try {
      await awardApplicationSubmissionXP(user.id)
    } catch (error) {
      console.error('Erreur attribution XP:', error)
    }

    // Envoi email notification
    try {
      await sendEmail({
        to: application.property.owner.email,
        subject: `📩 Nouvelle candidature pour ${application.property.title}`,
        react: NewApplicationEmail({
          ownerName: `${application.property.owner.firstName} ${application.property.owner.lastName}`,
          tenantName: `${application.tenant.firstName} ${application.tenant.lastName}`,
          propertyTitle: application.property.title,
          propertyAddress: `${application.property.address}, ${application.property.postalCode} ${application.property.city}`,
          applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/owner/applications`,
        }),
      })
      console.log(
        '✅ Application notification sent to owner:',
        application.property.owner.email
      )

      // 🆕 Notification in-app pour le propriétaire
      await prisma.notification.create({
        data: {
          userId: application.property.owner.id,
          type: 'SYSTEM',
          title: '📝 Nouvelle candidature',
          message: `${application.tenant.firstName} ${application.tenant.lastName} a postulé pour "${application.property.title}".`,
          link: '/owner/applications',
        },
      })
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError)
    }

    return NextResponse.json(
      {
        data: application,
        sharedDocumentsCount: application.sharedDocuments.length, // 🆕 Compteur
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Application error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la candidature' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les candidatures
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'owner' ou 'tenant'

    if (role === 'owner') {
      // Candidatures reçues (pour mes biens)
      const applications = await prisma.application.findMany({
        where: {
          property: {
            ownerId: user.id,
          },
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              rent: true,
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileComplete: true,
            },
          },
          // 🆕 Inclure le compteur de documents partagés
          sharedDocuments: {
            select: {
              id: true,
              viewedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: applications })
    } else {
      // Mes candidatures envoyées
      const applications = await prisma.application.findMany({
        where: {
          tenantId: user.id,
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              postalCode: true,
              rent: true,
              images: true,
              owner: {
                select: {
                  firstName: true,
                },
              },
            },
          },
          // 🆕 Inclure les documents partagés pour le locataire aussi
          sharedDocuments: {
            include: {
              document: {
                select: {
                  id: true,
                  type: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: applications })
    }
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des candidatures' },
      { status: 500 }
    )
  }
}
