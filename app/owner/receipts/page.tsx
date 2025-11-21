import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ReceiptAccordion from '@/components/receipts/ReceiptAccordion'
import ConfirmPaymentCard from '@/components/receipts/ConfirmPaymentCard'

export default async function OwnerReceiptsPage() {
  const session = await requireOwner()

  // Paiements déclarés en attente de confirmation
  const pendingPayments = await prisma.receipt.findMany({
    where: {
      lease: {
        property: { ownerId: session.user.id }
      },
      status: 'DECLARED'
    },
    include: {
      lease: {
        include: {
          property: { select: { title: true } },
          tenant: { select: { firstName: true, lastName: true } }
        }
      }
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  })

  // Quittances confirmées
  const confirmedReceipts = await prisma.receipt.findMany({
    where: {
      lease: {
        property: { ownerId: session.user.id }
      },
      status: 'CONFIRMED'
    },
    include: {
      lease: {
        include: {
          property: { select: { id: true, title: true, city: true } },
          tenant: { select: { firstName: true, lastName: true } }
        }
      }
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  })

  // Grouper les quittances confirmées par propriété
  const receiptsByProperty = confirmedReceipts.reduce((acc, receipt) => {
    const propertyId = receipt.lease.property.id
    const propertyTitle = receipt.lease.property.title
    const propertyCity = receipt.lease.property.city
    
    if (!acc[propertyId]) {
      acc[propertyId] = {
        title: propertyTitle,
        city: propertyCity,
        receipts: []
      }
    }
    acc[propertyId].receipts.push(receipt)
    return acc
  }, {} as Record<string, { title: string; city: string; receipts: typeof confirmedReceipts }>)

  const propertyIds = Object.keys(receiptsByProperty)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Paiements & Quittances
            </h1>
            <p className="text-gray-500 mt-1">
              {pendingPayments.length > 0 && `${pendingPayments.length} paiement${pendingPayments.length > 1 ? 's' : ''} à confirmer • `}
              {confirmedReceipts.length} quittance{confirmedReceipts.length > 1 ? 's' : ''} générée{confirmedReceipts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Paiements en attente de confirmation */}
        {pendingPayments.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span>⏳</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Paiements à confirmer
              </h2>
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {pendingPayments.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <ConfirmPaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </div>
        )}

        {/* Quittances confirmées */}
        {confirmedReceipts.length === 0 && pendingPayments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🧾</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune quittance
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Les quittances seront générées automatiquement lorsque vous confirmerez les paiements de vos locataires.
            </p>
            <Link
              href="/owner/leases"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Voir mes baux
            </Link>
          </div>
        ) : confirmedReceipts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span>✅</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Quittances générées
              </h2>
            </div>
            <div className="space-y-4">
              {propertyIds.map((propertyId, index) => {
                const property = receiptsByProperty[propertyId]
                return (
                  <ReceiptAccordion
                    key={propertyId}
                    propertyId={propertyId}
                    propertyTitle={property.title}
                    propertyCity={property.city}
                    receipts={property.receipts}
                    defaultOpen={index === 0}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}