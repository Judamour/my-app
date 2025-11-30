'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: Date
}

interface NotificationItemProps {
  notification: Notification
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const [isDeleted, setIsDeleted] = useState(false)
  const [isRead, setIsRead] = useState(notification.read)
  const router = useRouter()

  const handleClick = async () => {
    if (!isRead) {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
      })
      setIsRead(true)
    }

    if (notification.link) {
      router.push(notification.link)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    await fetch(`/api/notifications/${notification.id}`, {
      method: 'DELETE',
    })

    setIsDeleted(true)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Icône selon le type
  const getIcon = () => {
    if (notification.title.includes('✅')) return '✅'
    if (notification.title.includes('📄')) return '📄'
    if (notification.title.includes('🏠')) return '🏠'
    if (notification.title.includes('⭐')) return '⭐'
    if (notification.title.includes('👥')) return '👥'
    return '🔔'
  }

  if (isDeleted) return null

  return (
    <div
      onClick={handleClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isRead ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icône */}
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
          {getIcon()}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p
              className={`font-medium text-gray-900 ${!isRead ? 'font-semibold' : ''}`}
            >
              {notification.title.replace(/^[^\s]+\s/, '')}
            </p>
            {!isRead && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {formatDate(notification.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors p-2 -m-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
