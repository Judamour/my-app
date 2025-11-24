'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ReviewFormProps {
  leaseId: string
  targetName: string
  isOwner: boolean
}

export default function ReviewForm({ leaseId, targetName, isOwner }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [depositReturned, setDepositReturned] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Veuillez sélectionner une note')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId,
          rating,
          comment: comment.trim() || null,
          depositReturned,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success(data.message || 'Avis soumis avec succès !')
      router.push(`/${isOwner ? 'owner' : 'tenant'}/leases/${leaseId}`)
      router.refresh()
  } catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission'
  toast.error(errorMessage)
} finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Note */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Note globale *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-4xl transition-transform hover:scale-110"
            >
              <span
                className={
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-200'
                }
              >
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-3 text-lg font-medium text-gray-700">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Caution */}
      {isOwner && (
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Caution
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setDepositReturned(true)}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                depositReturned === true
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              ✅ Restituée
            </button>
            <button
              type="button"
              onClick={() => setDepositReturned(false)}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                depositReturned === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              ❌ Retenue
            </button>
          </div>
        </div>
      )}

      {/* Commentaire */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Commentaire (optionnel)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder={`Partagez votre expérience avec ${targetName}...`}
        />
        <p className="text-sm text-gray-400 mt-2">{comment.length}/1000 caractères</p>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-4 px-6 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="flex-1 py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Envoi...' : 'Soumettre l\'avis'}
        </button>
      </div>
    </form>
  )
}