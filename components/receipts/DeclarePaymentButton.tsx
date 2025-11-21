'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Lease {
  id: string
  monthlyRent: number
  charges: number | null
  startDate: Date
  property: {
    title: string
  }
}

interface DeclarePaymentButtonProps {
  leases: Lease[]
}

export default function DeclarePaymentButton({ leases }: DeclarePaymentButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedLease, setSelectedLease] = useState<string>('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [paymentMethod, setPaymentMethod] = useState('virement')
  const router = useRouter()

  const selectedLeaseData = leases.find(l => l.id === selectedLease)

  // Générer les mois disponibles (du début du bail jusqu'au mois en cours)
  const getAvailableMonths = () => {
    if (!selectedLeaseData) return []
    
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    const leaseStart = new Date(selectedLeaseData.startDate)
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
    
    if (!selectedLease) {
      toast.error('Veuillez sélectionner un bail')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/payments/declare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId: selectedLease,
          month,
          year,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Paiement déclaré ! Votre propriétaire a été notifié.')
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

  if (leases.length === 0) return null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
      >
        <span>💰</span>
        Déclarer un paiement
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
                <span className="text-2xl">💸</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Déclarer un paiement
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Votre propriétaire sera notifié
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sélection du bail */}
              {leases.length > 1 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logement concerné *
                  </label>
                  <select
                    value={selectedLease}
                    onChange={(e) => {
                      setSelectedLease(e.target.value)
                      setMonth(new Date().getMonth() + 1)
                      setYear(new Date().getFullYear())
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    {leases.map((lease) => (
                      <option key={lease.id} value={lease.id}>
                        {lease.property.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                // Auto-select si un seul bail
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Logement</p>
                  <p className="font-medium text-gray-900">{leases[0].property.title}</p>
                  {!selectedLease && setSelectedLease(leases[0].id)}
                </div>
              )}

              {/* Période payée */}
              {selectedLease && availableMonths.length > 0 && (
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
              )}

              {/* Mode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement utilisé
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
              {selectedLeaseData && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    📋 Récapitulatif
                  </p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Loyer</span>
                    <span className="font-medium">{formatPrice(selectedLeaseData.monthlyRent)}</span>
                  </div>
                  {selectedLeaseData.charges && selectedLeaseData.charges > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Charges</span>
                      <span className="font-medium">{formatPrice(selectedLeaseData.charges)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-blue-200 mt-2">
                    <span className="font-medium text-gray-900">Total déclaré</span>
                    <span className="font-semibold text-blue-700">
                      {formatPrice(selectedLeaseData.monthlyRent + (selectedLeaseData.charges || 0))}
                    </span>
                  </div>
                </div>
              )}

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
                  disabled={loading || !selectedLease}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? '⏳' : '✓'} Déclarer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}