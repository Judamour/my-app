'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ShareButtonProps {
  type: 'PROFILE' | 'PROPERTY'
  propertyId?: string
  className?: string
}

export default function ShareButton({ type, propertyId, className = '' }: ShareButtonProps) {
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleShare = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          propertyId: type === 'PROPERTY' ? propertyId : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du lien')
      }

      setShareUrl(data.fullUrl)
      setShowModal(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Lien copié !')
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <>
      {/* Bouton principal */}
      <button
        onClick={handleShare}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 ${className}`}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )}
        {type === 'PROFILE' ? 'Partager mon passport' : 'Partager ce bien'}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Lien de partage créé !
              </h2>
              <p className="text-gray-500 mt-1">
                {type === 'PROFILE' 
                  ? 'Envoyez ce lien à un propriétaire' 
                  : 'Envoyez ce lien à un locataire potentiel'}
              </p>
            </div>

            {/* URL */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Votre lien :</p>
              <p className="text-gray-900 font-mono text-sm break-all">
                {shareUrl}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copier le lien
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>

            {/* Info */}
            <p className="text-center text-xs text-gray-400 mt-4">
              {type === 'PROFILE' 
                ? 'Le propriétaire verra un aperçu de votre profil' 
                : 'Le locataire verra un aperçu du bien et pourra s\'inscrire'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}