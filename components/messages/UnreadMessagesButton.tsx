'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { pusherClient } from '@/lib/pusher-client'

export default function UnreadMessagesButton({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch initial count
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

    // 🔥 Écouter les messages via Pusher
    const channel = pusherClient.subscribe(`user-${userId}`)
    
    channel.bind('new-message', () => {
      // Incrémenter le compteur
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [userId])

  // Réinitialiser le compteur quand on ouvre /messages
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/messages') {
        setUnreadCount(0)
      }
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return (
    <Link
      href="/messages"
      className="relative flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200"
    >
      <span className="text-xl">💬</span>
      <span className="font-medium text-gray-700">Messages</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}