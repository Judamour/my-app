import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET : Récupérer les documents de profil de l'utilisateur connecté
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Documents de profil uniquement (leaseId = null)
    const documents = await prisma.document.findMany({
      where: {
        ownerId: session.user.id,
        leaseId: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Erreur GET user documents:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}