import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Récupérer un bail
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            ownerId: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    // Vérifier accès
    const isOwner = lease.property.ownerId === user.id
    const isTenant = lease.tenantId === user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json({ data: lease })
  } catch (error) {
    console.error('Get lease error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

// PATCH - Activer ou terminer un bail
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (!action || !['activate', 'end'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide (activate ou end)' },
        { status: 400 }
      )
    }

    // Récupérer le bail avec plus d'infos
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            ownerId: true,
            title: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        // 🆕 Récupérer tous les colocataires actifs
        tenants: {
          where: { leftAt: null },
          select: {
            tenantId: true,
          },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    // Vérifier que c'est le propriétaire
    if (lease.property.ownerId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Activer le bail
    if (action === 'activate') {
      if (lease.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Ce bail ne peut pas être activé' },
          { status: 400 }
        )
      }

      const updatedLease = await prisma.lease.update({
        where: { id },
        data: { status: 'ACTIVE' },
        include: {
          property: {
            select: { title: true },
          },
        },
      })

      // 🆕 Créer notification services pour le locataire
      await prisma.notification.create({
        data: {
          userId: lease.tenantId,
          type: 'SYSTEM',
          title: '🏠 Bienvenue dans votre nouveau logement !',
          message: `Votre bail pour "${updatedLease.property.title}" est maintenant actif. N'oubliez pas de souscrire à une assurance habitation (obligatoire) et de configurer vos services essentiels.`,
          link: '/tenant/services',
        },
      })

      return NextResponse.json({
        data: updatedLease,
        message: 'Bail activé',
      })
    }

    // Terminer le bail
    if (action === 'end') {
      if (lease.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Ce bail ne peut pas être terminé' },
          { status: 400 }
        )
      }

      // Mettre à jour le bail
      const updatedLease = await prisma.lease.update({
        where: { id },
        data: {
          status: 'ENDED',
          endDate: new Date(),
        },
      })

      // Remettre la propriété disponible
      await prisma.property.update({
        where: { id: lease.propertyId },
        data: {
          available: true,
          tenantId: null,
        },
      })

      // 🆕 Marquer tous les colocataires comme partis
      await prisma.leaseTenant.updateMany({
        where: {
          leaseId: id,
          leftAt: null,
        },
        data: {
          leftAt: new Date(),
        },
      })
      // 🆕 Créer notification pour chaque locataire/colocataire
      const ownerName = `${lease.property.owner.firstName} ${lease.property.owner.lastName}`
      const propertyTitle = lease.property.title
      const ownerId = lease.property.owner.id

      // Notifications pour les locataires
      const tenantNotifications = lease.tenants.map(tenant =>
        prisma.notification.create({
          data: {
            userId: tenant.tenantId,
            type: 'SYSTEM',
            title: '⭐ Notez votre expérience',
            message: `Votre bail pour "${propertyTitle}" est terminé. Partagez votre expérience avec ${ownerName} pour aider les futurs locataires.`,
            link: `/leases/${id}/review`,
          },
        })
      )

      // 🆕 Notification pour le propriétaire
      const tenantCount = lease.tenants.length
      const tenantLabel = tenantCount > 1 ? 'vos locataires' : 'votre locataire'

      const ownerNotification = prisma.notification.create({
        data: {
          userId: ownerId,
          type: 'SYSTEM',
          title: '⭐ Notez votre expérience',
          message: `Le bail pour "${propertyTitle}" est terminé. Partagez votre expérience avec ${tenantLabel} pour aider les futurs propriétaires.`,
          link: `/leases/${id}/review`,
        },
      })

      await Promise.all([...tenantNotifications, ownerNotification])

      return NextResponse.json({
        data: updatedLease,
        message: 'Bail terminé',
      })
    }
  } catch (error) {
    console.error('Update lease error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
