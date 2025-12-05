import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { syncUserXPWithBadges } from '@/lib/badges'

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await syncUserXPWithBadges(session.user.id)
    
    return NextResponse.json({
      success: true,
      xp: result.xp,
      level: result.level,
      newBadges: result.newBadges,
    })
  } catch (error) {
    console.error('Erreur sync badges:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}