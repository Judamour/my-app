'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface OwnerDeclarePaymentProps {
  leaseId: string
  monthlyRent: number
  charges: number | null
  startDate: Date
  tenantName: string
}

export default function OwnerDeclarePayment({
  leaseId,
  monthlyRent,
  charges,
  startDate,
  tenantName
}: OwnerDeclarePaymentProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [paymentMethod, setPaymentMethod] = useState('virement')
  const router = useRouter()

  // Générer les mois disponibles
  const getAvailableMonths = () => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    const leaseStart = new Date(startDate)
    const startMonth = leaseStart.getMonth() + 1
    const startYear = leaseStart.getFullYear()
    
    const months: { month: number; year: number; label: string }[] = []
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    
    let y = startYear
    let m = startMonth
    
    while (y < currentYear || (y === currentYear && m <= currentMonth)) {
      months.push({
        month: m,
        year: y,
        label: `${monthNames[m - 1]} ${y}`
      })
      
      m++
      if (m > 12) {
        m = 1
        y++
      }
    }
    
    return months.reverse()
  }

  const availableMonths = getAvailableMonths()

  const handleMonthSelect = (value: string) => {
    const [m, y] = value.split('-').map(Number)
    setMonth(m)
    setYear(y)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/payments/owner-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId,
          month,
          year,
          rentAmount: monthlyRent,
          charges: charges || 0,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Paiement confirmé ! Quittance générée.')
      setShowModal(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
      >
        💰 Confirmer un paiement reçu
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmer un paiement
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                De {tenantName}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Période */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mois payé *
                </label>
                <select
                  value={`${month}-${year}`}
                  onChange={(e) => handleMonthSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {availableMonths.map((m) => (
                    <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement reçu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'virement', label: '💳 Virement' },
                    { value: 'cheque', label: '📝 Chèque' },
                    { value: 'especes', label: '💵 Espèces' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-3 rounded-xl border-2 text-sm transition-all ${
                        paymentMethod === method.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-700 font-medium mb-2">
                  💰 Paiement reçu
                </p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Loyer</span>
                  <span className="font-medium">{formatPrice(monthlyRent)}</span>
                </div>
                {charges && charges > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Charges</span>
                    <span className="font-medium">{formatPrice(charges)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-emerald-200 mt-2">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-semibold text-emerald-700">
                    {formatPrice(monthlyRent + (charges || 0))}
                  </span>
                </div>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center">
                🔔 Le locataire sera notifié de la quittance générée
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? '⏳' : '✓'} Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}