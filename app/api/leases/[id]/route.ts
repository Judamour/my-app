import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Récupérer un bail
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
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
      }
    })

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      )
    }

    // Vérifier accès
    const isOwner = lease.property.ownerId === session.user.id
    const isTenant = lease.tenantId === session.user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
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
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (!action || !['activate', 'end'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide (activate ou end)' },
        { status: 400 }
      )
    }

    // Récupérer le bail
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            ownerId: true,
          }
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
    if (lease.property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
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
        data: { status: 'ACTIVE' }
      })

      return NextResponse.json({
        data: updatedLease,
        message: 'Bail activé'
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
          endDate: new Date()
        }
      })

      // Remettre la propriété disponible
      await prisma.property.update({
        where: { id: lease.propertyId },
        data: { 
          available: true,
          tenantId: null
        }
      })

      return NextResponse.json({
        data: updatedLease,
        message: 'Bail terminé'
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