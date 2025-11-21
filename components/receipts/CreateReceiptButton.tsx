'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Lease {
  id: string
  monthlyRent: number
  charges: number | null
  property: {
    title: string
  }
  tenant: {
    firstName: string
    lastName: string
  }
}

interface CreateReceiptButtonProps {
  leases: Lease[]
}

export default function CreateReceiptButton({ leases }: CreateReceiptButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedLease, setSelectedLease] = useState<string>('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [paymentMethod, setPaymentMethod] = useState('virement')
  const router = useRouter()

  const selectedLeaseData = leases.find(l => l.id === selectedLease)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedLease) {
      toast.error('Veuillez sélectionner un bail')
      return
    }

    setLoading(true)

    try {
      const lease = leases.find(l => l.id === selectedLease)
      if (!lease) return

      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId: selectedLease,
          month,
          year,
          rentAmount: lease.monthlyRent,
          charges: lease.charges || 0,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Quittance générée avec succès !')
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

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
      >
        <span>➕</span>
        Nouvelle quittance
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
                <span className="text-2xl">🧾</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Générer une quittance
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sélection du bail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bail *
                </label>
                <select
                  value={selectedLease}
                  onChange={(e) => setSelectedLease(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                >
                  <option value="">Sélectionner un bail</option>
                  {leases.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.property.title} - {lease.tenant.firstName} {lease.tenant.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Période */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mois *
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
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
                          ? 'border-gray-900 bg-gray-50'
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
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Récapitulatif</p>
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
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">
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
                  className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? '⏳' : 'Générer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}