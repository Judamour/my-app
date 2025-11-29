import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET : Récupérer un document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Vérifier l'accès (propriétaire du document)
    if (document.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Erreur GET document:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE : Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que le document existe et appartient à l'utilisateur
    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    if (document.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Supprimer le document
    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Document supprimé' })
  } catch (error) {
    console.error('Erreur DELETE document:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}