'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CreateLeaseModalProps {
  applicationId: string
  propertyTitle: string
  tenantName: string
  defaultRent: number
  onClose: () => void
}

export default function CreateLeaseModal({
  applicationId,
  propertyTitle,
  tenantName,
  defaultRent,
  onClose,
}: CreateLeaseModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rentAmount, setRentAmount] = useState(defaultRent.toString())
  const [depositAmount, setDepositAmount] = useState(defaultRent.toString())
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Calculer si la date est dans le passé
  const today = new Date().toISOString().split('T')[0]
  
  const isRetroactiveLease = useMemo(() => {
    if (!startDate) return false
    return startDate < today
  }, [startDate, today])

  // Calculer le nombre de mois de quittances à générer
  const monthsToGenerate = useMemo(() => {
    if (!startDate || !isRetroactiveLease) return 0
    
    const start = new Date(startDate)
    const now = new Date()
    
    // Calcul du nombre de mois
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    return Math.max(0, months + 1) // +1 pour inclure le mois en cours
  }, [startDate, isRetroactiveLease])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          startDate,
          endDate: endDate || null,
          rentAmount: Number(rentAmount),
          depositAmount: Number(depositAmount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      if (isRetroactiveLease) {
        toast.success(`Bail créé avec ${data.receiptsGenerated || 0} quittances générées !`)
      } else {
        toast.success('Bail créé avec succès !')
      }
      
      onClose()
      router.push(`/owner/leases/${data.data.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Créer un bail
          </h2>
          <p className="text-gray-500 mt-1">
            {propertyTitle}
          </p>
        </div>

        {/* Locataire */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500">Locataire</p>
          <p className="font-medium text-gray-900">{tenantName}</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
                <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Info bail rétroactif */}
          {isRetroactiveLease && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-lg">📅</span>
                <span>
                  <strong>Bail rétroactif détecté</strong><br />
                  Le bail sera directement <strong>actif</strong> et <strong>{monthsToGenerate} quittance{monthsToGenerate > 1 ? 's' : ''}</strong> seront générées automatiquement.
                </span>
              </p>
            </div>
          )}

          {/* Montants */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyer mensuel *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  min="1"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dépôt de garantie *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="0"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
          </div>

          {/* Info */}
          {!isRetroactiveLease && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700 flex items-start gap-2">
                <span>💡</span>
                <span>Le bail sera envoyé au locataire pour signature. La propriété sera marquée comme louée.</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                </span>
              ) : isRetroactiveLease ? (
                `Créer (${monthsToGenerate} quittances)`
              ) : (
                'Créer le bail'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}