'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ContactButtonProps {
  recipientId: string
  recipientName: string
  propertyId?: string
}

export default function ContactButton({ recipientId, recipientName, propertyId }: ContactButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleContact = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipientId,
          propertyId: propertyId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      router.push(`/messages/${data.data.id}`)
    } catch (error) {
      toast.error('Erreur lors de la création de la conversation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Chargement...
        </>
      ) : (
        <>
          <span>💬</span>
          Contacter {recipientName}
        </>
      )}
    </button>
  )
}