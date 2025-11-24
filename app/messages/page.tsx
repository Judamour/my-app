import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function MessagesPage() {
  const session = await requireAuth()

  // Récupérer le rôle de l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOwner: true, isTenant: true },
  })

  const dashboardUrl = user?.isOwner ? '/owner' : '/tenant'

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
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
        select: {
          content: true,
          createdAt: true,
          senderId: true,
          read: true,
        },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  // Calculer les messages non lus pour chaque conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async conv => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: session.user.id },
          read: false,
        },
      })

      // Déterminer l'autre participant
      const otherUser =
        conv.user1Id === session.user.id ? conv.user2 : conv.user1

      return { ...conv, unreadCount, otherUser }
    })
  )

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (days === 1) {
      return 'Hier'
    } else if (days < 7) {
      return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' })
    } else {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    }
  }

  const totalUnread = conversationsWithUnread.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link
            href={dashboardUrl}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
              <p className="text-gray-500 mt-1">
                {conversations.length} conversation
                {conversations.length > 1 ? 's' : ''}
                {totalUnread > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {conversationsWithUnread.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune conversation
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Vos conversations avec les propriétaires et locataires
              apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversationsWithUnread.map(conversation => {
              const lastMessage = conversation.messages[0]
              const isUnread = conversation.unreadCount > 0

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`block p-4 rounded-2xl transition-all ${
                    isUnread
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0 ${
                        isUnread
                          ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}
                    >
                      {conversation.otherUser.firstName[0]}
                      {conversation.otherUser.lastName[0]}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`font-semibold truncate ${
                            isUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {conversation.otherUser.firstName}{' '}
                          {conversation.otherUser.lastName}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 shrink-0">
                            {formatDate(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {conversation.property && (
                        <p className="text-xs text-gray-500 mb-1">
                          📍 {conversation.property.title}
                        </p>
                      )}

                      {lastMessage && (
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-500'
                          }`}
                        >
                          {lastMessage.senderId === session.user.id &&
                            'Vous : '}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Badge non lu */}
                    {isUnread && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
