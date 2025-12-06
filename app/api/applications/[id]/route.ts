import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { awardApplicationAcceptedXP } from '@/lib/xp'
import { sendEmail } from '@/lib/email/send-email'
import ApplicationAcceptedEmail from '@/emails/templates/ApplicationAcceptedEmail'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Accepter ou refuser une candidature
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Récupérer la candidature avec la propriété
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            ownerId: true,
            title: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      )
    }

    // 🆕 Vérifier les autorisations selon l'action
    const isOwner = application.property.ownerId === user.id
    const isTenant = application.tenantId === user.id

    // CANCELLED = seulement le locataire
    if (status === 'CANCELLED') {
      if (!isTenant) {
        return NextResponse.json(
          { error: 'Seul le candidat peut annuler sa candidature' },
          { status: 403 }
        )
      }
    } else {
      // ACCEPTED/REJECTED = seulement le propriétaire
      if (!isOwner) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }
    }

    // Vérifier que la candidature est en attente
    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette candidature a déjà été traitée' },
        { status: 400 }
      )
    }

    // ✅ Mettre à jour le statut AVEC les relations nécessaires
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
        tenant: true,
      },
    })

    // ✅ Envoyer l'email SI acceptée
    if (status === 'ACCEPTED') {
      try {
        await sendEmail({
          to: updatedApplication.tenant.email,
          subject: `🎉 Votre candidature a été acceptée !`,
          react: ApplicationAcceptedEmail({
            tenantName: `${updatedApplication.tenant.firstName} ${updatedApplication.tenant.lastName}`,
            ownerName: `${updatedApplication.property.owner.firstName} ${updatedApplication.property.owner.lastName}`,
            propertyTitle: updatedApplication.property.title,
            propertyAddress: `${updatedApplication.property.address}, ${updatedApplication.property.postalCode} ${updatedApplication.property.city}`,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant`,
          }),
        })
        console.log(
          '✅ Acceptance notification sent to tenant:',
          updatedApplication.tenant.email
        )
      } catch (emailError) {
        console.error('⚠️ Email sending failed:', emailError)
      }

      // ✅ Attribution XP
      try {
        await awardApplicationAcceptedXP(application.tenantId)
      } catch (error) {
        console.error('Erreur attribution XP:', error)
      }
    }

    // Retourner la réponse
    return NextResponse.json({
      data: updatedApplication,
      message:
        status === 'ACCEPTED' ? 'Candidature acceptée' : 'Candidature refusée',
    })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// GET - Récupérer une candidature spécifique
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            postalCode: true,
            rent: true,
            ownerId: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileComplete: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      )
    }

    // Vérifier accès : soit le propriétaire, soit le locataire
    const isOwner = application.property.ownerId === user.id
    const isTenant = application.tenantId === user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Si c'est le locataire et que la candidature n'est pas acceptée, masquer l'adresse
    if (isTenant && application.status !== 'ACCEPTED') {
      application.property.address = '***'
    }

    return NextResponse.json({ data: application })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}
