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
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors text-sm"
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