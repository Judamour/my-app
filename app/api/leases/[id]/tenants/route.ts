import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Liste des colocataires d'un bail
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: leaseId } = await params

    // Vérifier accès au bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: { select: { ownerId: true } },
        tenants: {
          where: { leftAt: null }, // Seulement les actifs
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { joinedAt: 'asc' }],
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est propriétaire ou colocataire
    const isOwner = lease.property.ownerId === session.user.id
    const isTenant = lease.tenants.some(t => t.tenantId === session.user.id)

    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json({
      data: lease.tenants,
      totalShare: lease.tenants.reduce((sum, t) => sum + t.share, 0),
    })
  } catch (error) {
    console.error('Get tenants error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Ajouter un colocataire
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: leaseId } = await params
    const body = await request.json()
    const { email, share = 50 } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est propriétaire du bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: {
          select: { ownerId: true, title: true },
        },
        tenants: {
          where: { leftAt: null },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    if (lease.property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Seul le propriétaire peut ajouter des colocataires' },
        { status: 403 }
      )
    }

    if (lease.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Le bail doit être actif pour ajouter des colocataires' },
        { status: 400 }
      )
    }

    // Limite de 5 colocataires
    if (lease.tenants.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 colocataires par bail' },
        { status: 400 }
      )
    }

    // Chercher l'utilisateur par email
    const tenant = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Si l'utilisateur n'existe pas, on ne peut pas l'ajouter (il doit créer un compte)
    if (!tenant) {
      return NextResponse.json(
        {
          error: 'Utilisateur non trouvé',
          message:
            "Cet email n'est pas inscrit sur la plateforme. Le colocataire doit d'abord créer un compte.",
        },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'est pas déjà colocataire
    const existingTenant = lease.tenants.find(t => t.tenantId === tenant!.id)
    if (existingTenant) {
      return NextResponse.json(
        { error: 'Cette personne est déjà colocataire de ce bail' },
        { status: 400 }
      )
    }

    // Créer le LeaseTenant
    const leaseTenant = await prisma.leaseTenant.create({
      data: {
        leaseId,
        tenantId: tenant.id,
        isPrimary: false,
        share,
        joinedAt: new Date(),
      },
      include: {
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

    // Marquer l'utilisateur comme locataire s'il ne l'est pas déjà
    if (!tenant.isTenant) {
      await prisma.user.update({
        where: { id: tenant.id },
        data: { isTenant: true },
      })
    }

    // Notification au nouveau colocataire
    await prisma.notification.create({
      data: {
        userId: tenant.id,
        type: 'SYSTEM',
        title: '🏠 Vous êtes ajouté à une colocation !',
        message: `Vous avez été ajouté comme colocataire pour "${lease.property.title}".`,
        link: `/tenant/leases`,
      },
    })

    return NextResponse.json({ data: leaseTenant }, { status: 201 })
  } catch (error) {
    console.error('Add tenant error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Modifier un colocataire (share, isPrimary)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: leaseId } = await params
    const body = await request.json()
    const { tenantId, share, isPrimary } = body

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est propriétaire
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: { select: { ownerId: true } },
        tenants: { where: { leftAt: null } },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    if (lease.property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Si on change le principal, retirer le statut des autres
    if (isPrimary === true) {
      await prisma.leaseTenant.updateMany({
        where: { leaseId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    // Mettre à jour le colocataire
    const updated = await prisma.leaseTenant.update({
      where: {
        leaseId_tenantId: { leaseId, tenantId },
      },
      data: {
        ...(share !== undefined && { share }),
        ...(isPrimary !== undefined && { isPrimary }),
      },
      include: {
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

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update tenant error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Retirer un colocataire
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: leaseId } = await params
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est propriétaire
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: { select: { ownerId: true, title: true } },
        tenants: { where: { leftAt: null } },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    if (lease.property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Vérifier que ce n'est pas le dernier colocataire
    if (lease.tenants.length <= 1) {
      return NextResponse.json(
        {
          error:
            'Impossible de retirer le dernier colocataire. Terminez le bail à la place.',
        },
        { status: 400 }
      )
    }

    // Vérifier si c'est le principal
    const tenantToRemove = lease.tenants.find(t => t.tenantId === tenantId)
    if (!tenantToRemove) {
      return NextResponse.json(
        { error: 'Colocataire non trouvé' },
        { status: 404 }
      )
    }

    // Marquer comme parti (soft delete)
    await prisma.leaseTenant.update({
      where: {
        leaseId_tenantId: { leaseId, tenantId },
      },
      data: { leftAt: new Date() },
    })

    // Si c'était le principal, promouvoir le premier restant
    if (tenantToRemove.isPrimary) {
      const nextPrimary = lease.tenants.find(t => t.tenantId !== tenantId)
      if (nextPrimary) {
        await prisma.leaseTenant.update({
          where: {
            leaseId_tenantId: { leaseId, tenantId: nextPrimary.tenantId },
          },
          data: { isPrimary: true },
        })
      }
    }

    // Notification au colocataire retiré
    await prisma.notification.create({
      data: {
        userId: tenantId,
        type: 'SYSTEM',
        title: "🏠 Vous avez été retiré d'une colocation",
        message: `Vous n'êtes plus colocataire de "${lease.property.title}".`,
        link: `/tenant/leases`,
      },
    })

    return NextResponse.json({ message: 'Colocataire retiré' })
  } catch (error) {
    console.error('Remove tenant error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
