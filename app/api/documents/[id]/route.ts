import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteDocument } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

// DELETE - Supprimer un document
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le document
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        lease: {
          include: { property: true },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document introuvable' },
        { status: 404 }
      )
    }

    // Vérifier autorisation
    const isOwner = document.ownerId === session.user.id
    const isPropertyOwner = document.lease?.property.ownerId === session.user.id

    if (!isOwner && !isPropertyOwner) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Supprimer de Supabase
    await deleteDocument(document.url)

    // Supprimer de la DB
    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Document supprimé' })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}