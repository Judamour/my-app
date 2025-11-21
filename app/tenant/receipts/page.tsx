import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReceiptAccordionTenant from '@/components/receipts/ReceiptAccordionTenant'
import DeclarePaymentButton from '@/components/receipts/DeclarePaymentButton'

export default async function TenantReceiptsPage() {
  const session = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isTenant: true }
  })

  if (!user?.isTenant) {
    redirect('/profile/complete?required=tenant')
  }

  // Baux actifs pour déclarer un paiement
  const activeLeases = await prisma.lease.findMany({
    where: {
      tenantId: session.user.id,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      monthlyRent: true,
      charges: true,
      startDate: true,
      property: { select: { title: true } }
    }
  })

  // Paiements déclarés en attente de confirmation
  const pendingPayments = await prisma.receipt.findMany({
    where: {
      lease: { tenantId: session.user.id },
      status: 'DECLARED'
    },
    include: {
      lease: {
        include: {
          property: { select: { title: true } }
        }
      }
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  })

  // Quittances confirmées
  const confirmedReceipts = await prisma.receipt.findMany({
    where: {
      lease: { tenantId: session.user.id },
      status: 'CONFIRMED'
    },
    include: {
      lease: {
        include: {
          property: { 
            select: { 
              id: true,
              title: true, 
              address: true, 
              city: true 
            } 
          }
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            href="/tenant"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mon espace
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Mes paiements
              </h1>
              <p className="text-gray-500 mt-1">
                {confirmedReceipts.length} quittance{confirmedReceipts.length > 1 ? 's' : ''} disponible{confirmedReceipts.length > 1 ? 's' : ''}
              </p>
            </div>
            {activeLeases.length > 0 && (
              <DeclarePaymentButton leases={activeLeases} />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Paiements en attente de confirmation */}
        {pendingPayments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ⏳ En attente de confirmation
            </h2>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⏳</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getMonthName(payment.month)} {payment.year}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {payment.lease.property.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(payment.totalAmount)}
                    </p>
                    <p className="text-xs text-orange-600">
                      En attente de validation
                    </p>
                  </div>
                </div>
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
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Déclarez votre premier paiement pour obtenir une quittance.
            </p>
            {activeLeases.length > 0 && (
              <DeclarePaymentButton leases={activeLeases} />
            )}
          </div>
        ) : confirmedReceipts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ✅ Quittances disponibles
            </h2>
            <div className="space-y-4">
              {propertyIds.map((propertyId, index) => {
                const property = receiptsByProperty[propertyId]
                return (
                  <ReceiptAccordionTenant
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