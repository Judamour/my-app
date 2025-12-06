import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { awardMessageXP } from '@/lib/xp'
import { sendEmail } from '@/lib/email/send-email'
import NewMessageEmail from '@/emails/templates/NewMessageEmail'
import { 
  canSendMessageEmail, 
  markMessageEmailSent, 
  getUnreadMessagesSinceLastEmail 
} from '@/lib/email/email-throttle'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Récupérer les messages d'une conversation
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user) {
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
      conversation.user1Id !== user.id &&
      conversation.user2Id !== user.id
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
        senderId: { not: user.id },
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user) {
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
      conversation.user1Id !== user.id &&
      conversation.user2Id !== user.id
    ) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Déterminer le destinataire
    const recipientId = conversation.user1Id === user.id 
      ? conversation.user2Id 
      : conversation.user1Id

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true 
          },
        },
      },
    })

    // Attribution XP pour message envoyé (limité à 1 par minute pour éviter spam)
    try {
      const recentMessages = await prisma.message.count({
        where: {
          senderId: user.id,
          createdAt: { gte: new Date(Date.now() - 60000) }, // 1 minute
        },
      })
      
      if (recentMessages <= 1) {
        await awardMessageXP(user.id)
      }
    } catch (error) {
      console.error('Erreur attribution XP:', error)
    }

    // ✅ NOUVEAU : Envoyer l'email avec throttling (max 1 par 24h)
    try {
      const canSend = await canSendMessageEmail(recipientId)
      
      if (canSend) {
        const unreadCount = await getUnreadMessagesSinceLastEmail(recipientId)
        
        // Récupérer les infos du destinataire
        const recipient = await prisma.user.findUnique({
          where: { id: recipientId },
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        })

        if (recipient) {
          await sendEmail({
            to: recipient.email,
            subject: unreadCount > 1 
              ? `💬 ${unreadCount} nouveaux messages sur RentEasy`
              : `💬 Nouveau message de ${message.sender.firstName} ${message.sender.lastName}`,
            react: NewMessageEmail({
              recipientName: `${recipient.firstName} ${recipient.lastName}`,
              senderName: `${message.sender.firstName} ${message.sender.lastName}`,
              messagePreview: message.content,
              unreadCount: unreadCount || 1,
              messagesUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages`,
            }),
          })

          await markMessageEmailSent(recipientId)
          console.log(`✅ Message notification sent to: ${recipient.email} (${unreadCount} unread)`)
        }
      } else {
        console.log(`⏳ Message email throttled for user ${recipientId} (< 24h since last email)`)
      }
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError)
    }

    // 🔥 TRIGGER PUSHER
    await pusherServer.trigger(`conversation-${id}`, 'new-message', {
      message,
    })

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