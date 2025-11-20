'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ApplyButtonProps {
  propertyId: string
}

export default function ApplyButton({ propertyId }: ApplyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleApply = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          message: message || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la candidature')
      }

      toast.success('Candidature envoyée avec succès !')
      setShowModal(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bouton principal */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-xl hover:from-rose-600 hover:to-orange-600 transition-all"
      >
        Postuler à ce bien
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Envoyer ma candidature
              </h2>
              <p className="text-gray-500 mt-1">
                Le propriétaire recevra votre profil
              </p>
            </div>

            {/* Message optionnel */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message au propriétaire
                <span className="text-gray-400 font-normal ml-2">(optionnel)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                placeholder="Présentez-vous brièvement..."
              />
            </div>

            {/* Info passport */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <span>💡</span>
                <span>Votre passport de confiance sera partagé avec le propriétaire pour appuyer votre candidature.</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                  </span>
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}