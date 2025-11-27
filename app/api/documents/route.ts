import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Liste des documents d'un bail
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leaseId = searchParams.get('leaseId')

    if (!leaseId) {
      return NextResponse.json(
        { error: 'leaseId requis' },
        { status: 400 }
      )
    }

    // Vérifier accès au bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true },
    })

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      )
    }

    const isOwner = lease.property.ownerId === session.user.id
    const isTenant = lease.tenantId === session.user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Récupérer les documents
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
      orderBy: { id: 'desc' },
    })

    return NextResponse.json({ data: documents })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}