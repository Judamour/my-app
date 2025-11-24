'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  TENANT_CRITERIA_LABELS,
  OWNER_CRITERIA_LABELS,
  TenantCriteria,
  OwnerCriteria,
  calculateFinalRating,
} from '@/types/review'

interface ReviewFormProps {
  leaseId: string
  targetName: string
  isOwner: boolean
}

export default function ReviewForm({
  leaseId,
  targetName,
  isOwner,
}: ReviewFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Critères pour locataire ou propriétaire
  const [criteria, setCriteria] = useState<TenantCriteria | OwnerCriteria>(
    isOwner
      ? {
          cleanliness: 0,
          respectProperty: 0,
          paymentPunctuality: 0,
          communication: 0,
          neighborRelations: 0,
        }
      : {
          propertyCondition: 0,
          responsiveness: 0,
          respectCommitments: 0,
          communication: 0,
          fairness: 0,
        }
  )

  // Caution (uniquement pour propriétaires)
  const [depositReturned, setDepositReturned] = useState<boolean>(true) // true par défaut
  const [depositReturnedPercent, setDepositReturnedPercent] =
    useState<number>(100)

  const [comment, setComment] = useState('')

  const criteriaLabels = isOwner
    ? TENANT_CRITERIA_LABELS
    : OWNER_CRITERIA_LABELS

  const updateCriterion = (key: string, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }))
  }

  // Calcul note finale en temps réel
  const finalRating = calculateFinalRating(
    criteria,
    isOwner ? depositReturned ?? undefined : undefined,
    isOwner ? depositReturnedPercent : undefined
  )

  // Validation
  const allCriteriaFilled = Object.values(criteria).every(val => val > 0)
  const isValid = allCriteriaFilled

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error('Veuillez remplir tous les critères')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId,
          rating: finalRating,
          criteria,
          comment: comment.trim() || null,
          depositReturned: isOwner ? depositReturned : null,
        
          depositReturnedPercent: isOwner ? depositReturnedPercent : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success(data.message || 'Avis soumis avec succès !')
      router.push(isOwner ? '/owner' : '/tenant')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors de la soumission'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Note finale preview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Note finale calculée</p>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`text-4xl ${
                star <= Math.round(finalRating)
                  ? 'text-yellow-400'
                  : 'text-gray-200'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {finalRating.toFixed(1)}/5
        </p>
        {isOwner && (
          <p className="text-xs text-gray-500 mt-2">
            Critères (25%) + Caution (75%)
          </p>
        )}
      </div>

      {/* Critères détaillés */}
      <div className="space-y-6">
        <h3 className="font-semibold text-gray-900">
          Évaluez {targetName} sur plusieurs critères
        </h3>

        {Object.entries(criteriaLabels).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <span className="text-sm text-gray-500">
                {criteria[key as keyof typeof criteria] || 0}/5
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateCriterion(key, star)}
                  className="group"
                >
                  <span
                    className={`text-3xl transition-colors ${
                      star <= (criteria[key as keyof typeof criteria] || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-200 group-hover:text-yellow-200'
                    }`}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Caution (propriétaires uniquement) */}
      {isOwner && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            Restitution de la caution (75% de la note)
          </h3>
          <p className="text-sm text-gray-600">
            La caution est le critère le plus important pour garantir
            l&apos;équité
          </p>

          {/* Slider direct 0-100% */}
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">
                Pourcentage restitué
              </label>
              <span className="text-2xl font-bold text-gray-900">
                {depositReturnedPercent}%
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={depositReturnedPercent}
              onChange={e => {
                const value = parseInt(e.target.value)
                setDepositReturnedPercent(value)
                setDepositReturned(value > 0)
              }}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />

            {/* Labels visuels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>

            {/* Feedback visuel */}
            <div className="mt-4 p-3 rounded-lg text-center text-sm font-medium">
              {depositReturnedPercent === 100 && (
                <div className="text-emerald-700 bg-emerald-50 rounded-lg p-2">
                  ✅ Caution intégralement restituée - Maximum d&apos;étoiles !
                </div>
              )}
              {depositReturnedPercent > 0 && depositReturnedPercent < 100 && (
                <div className="text-orange-700 bg-orange-50 rounded-lg p-2">
                  ⚠️ Caution partiellement restituée ({depositReturnedPercent}%)
                </div>
              )}
              {depositReturnedPercent === 0 && (
                <div className="text-red-700 bg-red-50 rounded-lg p-2">
                  ❌ Caution retenue - Impact significatif sur la note
                </div>
              )}
            </div>

            {/* Explication du calcul */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-900 font-medium mb-1">
                💡 Impact sur la note finale :
              </p>
              <p className="text-xs text-blue-700">
                • Critères :{' '}
                {(
                  (Object.values(criteria).reduce(
                    (sum: number, val) => sum + (val as number),
                    0
                  ) /
                    Object.keys(criteria).length) *
                  0.25
                ).toFixed(2)}{' '}
                pts (25%)
              </p>
              <p className="text-xs text-blue-700">
                • Caution :{' '}
                {((depositReturnedPercent / 100) * 5 * 0.75).toFixed(2)} pts
                (75%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Commentaire */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Commentaire (optionnel)
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value.slice(0, 1000))}
          rows={4}
          className="text-gray-900 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
          placeholder="Partagez votre expérience..."
        />
        <p className="text-xs text-gray-400 text-right">
          {comment.length}/1000
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Soumission...' : "Soumettre l'avis"}
      </button>
    </div>
  )
}
