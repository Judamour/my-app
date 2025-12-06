import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const {
      showBadges,
      showLevel,
      showRankBorder,
      showReviewStats,
      showPhone,
      showAddress,
    } = body

    // Mise à jour des préférences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        showBadges: showBadges ?? undefined,
        showLevel: showLevel ?? undefined,
        showRankBorder: showRankBorder ?? undefined,
        showReviewStats: showReviewStats ?? undefined,
        showPhone: showPhone ?? undefined,
        showAddress: showAddress ?? undefined,
      },
      select: {
        showBadges: true,
        showLevel: true,
        showRankBorder: true,
        showReviewStats: true,
        showPhone: true,
        showAddress: true,
      },
    })

    return NextResponse.json({
      message: 'Préférences mises à jour',
      data: updatedUser,
    })
  } catch (error) {
    console.error('Erreur mise à jour préférences:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}