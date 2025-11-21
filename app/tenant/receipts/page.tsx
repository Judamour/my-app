import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TenantReceiptsPage() {
  const session = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isTenant: true }
  })

  if (!user?.isTenant) {
    redirect('/profile/complete?required=tenant')
  }

  const receipts = await prisma.receipt.findMany({
    where: {
      lease: { tenantId: session.user.id }
    },
    include: {
      lease: {
        include: {
          property: { 
            select: { 
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Grouper par année
  const receiptsByYear = receipts.reduce((acc, receipt) => {
    if (!acc[receipt.year]) {
      acc[receipt.year] = []
    }
    acc[receipt.year].push(receipt)
    return acc
  }, {} as Record<number, typeof receipts>)

  const years = Object.keys(receiptsByYear).sort((a, b) => Number(b) - Number(a))

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
          <h1 className="text-3xl font-semibold text-gray-900">
            Mes quittances
          </h1>
          <p className="text-gray-500 mt-1">
            {receipts.length} quittance{receipts.length > 1 ? 's' : ''} disponible{receipts.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {receipts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🧾</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune quittance
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Vos quittances de loyer apparaîtront ici une fois générées par votre propriétaire.
            </p>
            <Link
              href="/tenant/leases"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Voir mes baux
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {years.map((year) => (
              <div key={year}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {year}
                </h2>
                <div className="space-y-3">
                  {receiptsByYear[Number(year)].map((receipt) => (
                    <Link
                      key={receipt.id}
                      href={`/tenant/receipts/${receipt.id}`}
                      className="flex items-center justify-between p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <span className="text-xl">🧾</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getMonthName(receipt.month)} {receipt.year}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {receipt.lease.property.title}
                          </p>
                          {receipt.paidAt && (
                            <p className="text-xs text-emerald-600 mt-1">
                              ✓ Payé le {formatDate(receipt.paidAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-gray-900">
                          {formatPrice(receipt.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {receipt.paymentMethod === 'virement' && '💳 Virement'}
                          {receipt.paymentMethod === 'cheque' && '📝 Chèque'}
                          {receipt.paymentMethod === 'especes' && '💵 Espèces'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}