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
  const [hasApplied, setHasApplied] = useState(false)
  const router = useRouter()

  const handleApply = async () => {
    // Protection double-clic
    if (loading || hasApplied) return
    
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

      // Marquer comme postulé AVANT de fermer le modal
      setHasApplied(true)
      toast.success('Candidature envoyée avec succès !')
      setShowModal(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
      setLoading(false)
    }
  }

  // Si déjà postulé, afficher un message de confirmation
  if (hasApplied) {
    return (
      <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
        <p className="font-medium text-emerald-700 flex items-center justify-center gap-2">
          <span>✅</span>
          Candidature envoyée
        </p>
        <p className="text-sm text-emerald-600 mt-1">
          Le propriétaire va étudier votre profil
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Bouton principal */}
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-xl hover:from-rose-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 transition-all"
      >
        Postuler à ce bien
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => !loading && setShowModal(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none disabled:bg-gray-50"
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
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Envoi...
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