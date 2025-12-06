import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer mes conversations
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id },
        ],
      },
      include: {
        user1: {
          select: { id: true, firstName: true, lastName: true },
        },
        user2: {
          select: { id: true, firstName: true, lastName: true },
        },
        property: {
          select: { id: true, title: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Ajouter le compteur de messages non lus
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            read: false,
          },
        })
        return { ...conv, unreadCount }
      })
    )

    return NextResponse.json({ data: conversationsWithUnread })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    )
  }
}

// POST - Créer ou récupérer une conversation
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { recipientId, propertyId } = await request.json()

    if (!recipientId) {
      return NextResponse.json({ error: 'recipientId requis' }, { status: 400 })
    }

    // Vérifier que le destinataire existe
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Destinataire introuvable' }, { status: 404 })
    }

    // Chercher une conversation existante
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: recipientId, propertyId: propertyId || null },
          { user1Id: recipientId, user2Id: user.id, propertyId: propertyId || null },
        ],
      },
    })

    if (existingConversation) {
      return NextResponse.json({ data: existingConversation })
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: user.id,
        user2Id: recipientId,
        propertyId: propertyId || null,
      },
    })

    return NextResponse.json({ data: conversation }, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    )
  }
}