'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Payment {
  id: string
  month: number
  year: number
  totalAmount: number
  paymentMethod: string | null
  declaredAt: Date | null
  lease: {
    property: { title: string }
    tenant: { firstName: string; lastName: string }
  }
}

interface ConfirmPaymentCardProps {
  payment: Payment
}

export default function ConfirmPaymentCard({ payment }: ConfirmPaymentCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/receipts/${payment.id}/confirm`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Paiement confirmé ! Quittance générée.')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return months[month - 1]
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-orange-50 border border-orange-200 rounded-xl gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
          <span className="text-xl">💰</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {payment.lease.tenant.firstName} {payment.lease.tenant.lastName}
          </h3>
          <p className="text-sm text-gray-600">
            {payment.lease.property.title} • {getMonthName(payment.month)} {payment.year}
          </p>
          {payment.declaredAt && (
            <p className="text-xs text-orange-600 mt-1">
              Déclaré le {formatDate(payment.declaredAt)}
              {payment.paymentMethod && ` • ${payment.paymentMethod === 'virement' ? '💳 Virement' : payment.paymentMethod === 'cheque' ? '📝 Chèque' : '💵 Espèces'}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-900">
            {formatPrice(payment.totalAmount)}
          </p>
        </div>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
        >
          {loading ? '⏳' : '✓'} Confirmer
        </button>
      </div>
    </div>
  )
}