import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET : Récupérer les documents de profil de l'utilisateur connecté
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Documents de profil uniquement (leaseId = null)
    const documents = await prisma.document.findMany({
      where: {
        ownerId: user.id,
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