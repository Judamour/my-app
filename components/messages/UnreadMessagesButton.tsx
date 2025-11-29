'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  userId?: string
}

export default function UnreadMessagesButton({ userId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch initial count - une seule fois au montage
    const fetchUnread = async () => {
      try {
        const response = await fetch('/api/messages/unread-count')
        const data = await response.json()
        if (data.count !== undefined) {
          setUnreadCount(data.count)
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnread()

    // ❌ DÉSACTIVÉ : Plus d'auto-refresh ni Pusher
    // Les messages non lus se mettront à jour au rechargement de la page
  }, [])

  return (
    <Link
      href="/messages"
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {/* Icône message */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Badge compteur */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
