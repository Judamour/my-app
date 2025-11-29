import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET : Liste des documents (optionnel)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leaseId = searchParams.get('leaseId')
    const propertyId = searchParams.get('propertyId')

    const documents = await prisma.document.findMany({
      where: {
        ownerId: session.user.id,
        ...(leaseId && { leaseId }),
        ...(propertyId && { propertyId }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
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

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST document:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}