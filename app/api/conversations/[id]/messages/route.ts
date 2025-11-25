import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { awardMessageXP } from '@/lib/xp'


interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Récupérer les messages d'une conversation
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation introuvable' },
        { status: 404 }
      )
    }

    if (
      conversation.user1Id !== session.user.id &&
      conversation.user2Id !== session.user.id
    ) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.user.id },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ data: messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    )
  }
}

// POST - Envoyer un message
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation introuvable' },
        { status: 404 }
      )
    }

    if (
      conversation.user1Id !== session.user.id &&
      conversation.user2Id !== session.user.id
    ) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    // Attribution XP pour message envoyé (limité à 1 par minute pour éviter spam)
try {
  const recentMessages = await prisma.message.count({
    where: {
      senderId: session.user.id,
      createdAt: { gte: new Date(Date.now() - 60000) }, // 1 minute
    },
  })
  
  if (recentMessages <= 1) {
    await awardMessageXP(session.user.id)
  }
} catch (error) {
  console.error('Erreur attribution XP:', error)
}

    // 🔥 TRIGGER PUSHER
    await pusherServer.trigger(`conversation-${id}`, 'new-message', {
      message,
    })

    // Trigger pour la conversation
await pusherServer.trigger(`conversation-${id}`, 'new-message', {
  message,
})

// 🔥 Trigger pour le destinataire (compteur)
const recipientId = conversation.user1Id === session.user.id 
  ? conversation.user2Id 
  : conversation.user1Id

await pusherServer.trigger(`user-${recipientId}`, 'new-message', {
  messageId: message.id,
})

    // Mettre à jour lastMessageAt de la conversation
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    )
  }
}
