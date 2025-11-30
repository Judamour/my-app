'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MarkAllReadButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? 'Chargement...' : 'Tout marquer comme lu'}
    </button>
  )
}