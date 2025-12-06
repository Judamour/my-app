import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncUserXPWithBadges } from '@/lib/badges'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await syncUserXPWithBadges(user.id)
    
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