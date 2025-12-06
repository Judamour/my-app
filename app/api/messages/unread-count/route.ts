import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [{ user1Id: user.id }, { user2Id: user.id }],
        },
        senderId: { not: user.id },
        read: false,
      },
    })

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('Get unread count error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}
