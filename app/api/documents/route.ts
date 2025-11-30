import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET : Liste des documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leaseId = searchParams.get('leaseId')
    const propertyId = searchParams.get('propertyId')

    // Si leaseId, vérifier l'accès au bail
    if (leaseId) {
      const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
          property: { select: { ownerId: true } },
          tenants: { 
            where: { leftAt: null },
            select: { tenantId: true } 
          },
        },
      })

      if (!lease) {
        return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
      }

      // Vérifier accès : propriétaire, tenant principal, ou colocataire
      const isOwner = lease.property.ownerId === session.user.id
      const isMainTenant = lease.tenantId === session.user.id
      const isCoTenant = lease.tenants.some(t => t.tenantId === session.user.id)

      if (!isOwner && !isMainTenant && !isCoTenant) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }

      // Récupérer tous les documents du bail (de tous les utilisateurs)
      const documents = await prisma.document.findMany({
        where: { leaseId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: documents })
    }

    // Si propertyId, vérifier l'accès à la propriété
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { ownerId: true },
      })

      if (!property || property.ownerId !== session.user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }

      const documents = await prisma.document.findMany({
        where: { propertyId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: documents })
    }

    // Sinon, documents personnels de l'utilisateur
    const documents = await prisma.document.findMany({
      where: { ownerId: session.user.id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: documents })
  } catch (error) {
    console.error('Erreur GET documents:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST : Créer un document
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, url, size, mimeType, propertyId, leaseId } = body

    // Validation
    if (!type || !name || !url) {
      return NextResponse.json(
        { error: 'Type, nom et URL requis' },
        { status: 400 }
      )
    }

    // Si leaseId, vérifier l'accès au bail
    if (leaseId) {
      const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
          property: { select: { ownerId: true } },
          tenants: { 
            where: { leftAt: null },
            select: { tenantId: true } 
          },
        },
      })

      if (!lease) {
        return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
      }

      const isOwner = lease.property.ownerId === session.user.id
      const isMainTenant = lease.tenantId === session.user.id
      const isCoTenant = lease.tenants.some(t => t.tenantId === session.user.id)

      if (!isOwner && !isMainTenant && !isCoTenant) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }
    }

    // Créer le document
    const document = await prisma.document.create({
      data: {
        ownerId: session.user.id,
        type,
        name,
        url,
        size: size || null,
        mimeType: mimeType || null,
        propertyId: propertyId || null,
        leaseId: leaseId || null,
        verified: false,
      },
    })

    return NextResponse.json({ data: document }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST document:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}