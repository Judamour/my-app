import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ChatMessages from '@/components/messages/ChatMessages'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const session = await requireAuth()
  const { id } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id },
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
    },
  })

  if (!conversation) {
    notFound()
  }

  // Vérifier que l'utilisateur fait partie de la conversation
  if (conversation.user1Id !== session.user.id && conversation.user2Id !== session.user.id) {
    redirect('/messages')
  }

  // Déterminer l'autre participant
  const otherUser = conversation.user1Id === session.user.id ? conversation.user2 : conversation.user1

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/messages"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                {otherUser.firstName[0]}{otherUser.lastName[0]}
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {otherUser.firstName} {otherUser.lastName}
                </h1>
                {conversation.property && (
                  <p className="text-xs text-gray-500">
                    📍 {conversation.property.title}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={`/profile/${otherUser.id}`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Voir le profil"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages
        conversationId={id}
        currentUserId={session.user.id}
        initialMessages={messages}
      />
    </div>
  )
}