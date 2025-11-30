import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import NotificationItem from '@/components/notifications/NotificationItem'
import Header from '@/components/layout/header'
import MarkAllReadButton from '@/components/notifications/MarkAllReadButton'

export default async function NotificationsPage() {
  const session = await requireAuth()

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Grouper par date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    let key: string
    if (date.toDateString() === today.toDateString()) {
      key = "Aujourd'hui"
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Hier'
    } else {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      if (date > weekAgo) {
        key = 'Cette semaine'
      } else {
        key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      }
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(notification)
    return groups
  }, {} as Record<string, typeof notifications>)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-4">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-500 mt-1">
                  {unreadCount > 0 
                    ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Toutes lues'
                  }
                </p>
              </div>
              {unreadCount > 0 && (
                <MarkAllReadButton />
              )}
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune notification
              </h2>
              <p className="text-gray-500">
                Vous n&apos;avez pas encore reçu de notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                    {date}
                  </h2>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                    {items.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

