import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { user1Id: session.user.id },
            { user2Id: session.user.id },
          ],
        },
        senderId: { not: session.user.id },
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