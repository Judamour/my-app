'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Receipt {
  id: string
  month: number
  year: number
  totalAmount: number
  paymentMethod: string | null
  paidAt: Date | null
}

interface ReceiptAccordionByTenantProps {
  propertyTitle: string
  propertyCity: string
  tenantName: string
  receipts: Receipt[]
  defaultOpen?: boolean
}

export default function ReceiptAccordionByTenant({
  propertyTitle,
  propertyCity,
  tenantName,
  receipts,
  defaultOpen = false
}: ReceiptAccordionByTenantProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return months[month - 1]
  }

  // Calculer le total des quittances
  const totalAmount = receipts.reduce((sum, r) => sum + r.totalAmount, 0)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header accordéon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold">
            {tenantName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{tenantName}</h3>
            <p className="text-sm text-gray-500">
              🏠 {propertyTitle} • 📍 {propertyCity}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">{receipts.length} quittance{receipts.length > 1 ? 's' : ''}</p>
            <p className="font-semibold text-gray-900">{formatPrice(totalAmount)}</p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Contenu */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="space-y-2">
            {receipts.map((receipt) => (
              <Link
                key={receipt.id}
                href={`/owner/receipts/${receipt.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🧾</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getMonthName(receipt.month)} {receipt.year}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {receipt.paymentMethod === 'virement' && '💳 Virement'}
                      {receipt.paymentMethod === 'cheque' && '📝 Chèque'}
                      {receipt.paymentMethod === 'especes' && '💵 Espèces'}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatPrice(receipt.totalAmount)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}