'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Receipt {
  id: string
  month: number
  year: number
  totalAmount: number
  paymentMethod: string | null
  lease: {
    tenant: {
      firstName: string
      lastName: string
    }
  }
}

interface ReceiptAccordionProps {
  propertyId: string
  propertyTitle: string
  propertyCity: string
  receipts: Receipt[]
  defaultOpen?: boolean
}

export default function ReceiptAccordion({
  propertyId,
  propertyTitle,
  propertyCity,
  receipts,
  defaultOpen = false
}: ReceiptAccordionProps) {
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
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-xl">🏠</span>
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-gray-900">
              {propertyTitle}
            </h2>
            <p className="text-sm text-gray-500">
              📍 {propertyCity} • {receipts.length} quittance{receipts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">Total généré</p>
            <p className="font-semibold text-gray-900">{formatPrice(totalAmount)}</p>
          </div>
          <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Contenu déroulant */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-white">
          {receipts.map((receipt) => (
            <Link
              key={receipt.id}
              href={`/owner/receipts/${receipt.id}`}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🧾</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getMonthName(receipt.month)} {receipt.year}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {receipt.lease.tenant.firstName} {receipt.lease.tenant.lastName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatPrice(receipt.totalAmount)}
                </p>
                <p className="text-xs text-gray-400">
                  {receipt.paymentMethod === 'virement' && '💳 Virement'}
                  {receipt.paymentMethod === 'cheque' && '📝 Chèque'}
                  {receipt.paymentMethod === 'especes' && '💵 Espèces'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}