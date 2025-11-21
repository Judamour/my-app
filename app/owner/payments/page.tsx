import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Accordion from '@/components/ui/Accordion'

export default async function OwnerPaymentsPage() {
  const session = await requireOwner()

  // Récupérer tous les paiements confirmés
  const payments = await prisma.receipt.findMany({
    where: {
      lease: {
        property: { ownerId: session.user.id },
      },
      status: 'CONFIRMED',
    },
    include: {
      lease: {
        include: {
          property: {
            select: { title: true, city: true },
          },
          tenant: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  })

  // Grouper par mois
  const paymentsByMonth: Record<string, typeof payments> = {}

  payments.forEach(payment => {
    const date = payment.paidAt
      ? new Date(payment.paidAt)
      : new Date(payment.createdAt)
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`

    if (!paymentsByMonth[monthKey]) {
      paymentsByMonth[monthKey] = []
    }
    paymentsByMonth[monthKey].push(payment)
  })

  // Calculer les totaux par mois
  const monthlyTotals = Object.entries(paymentsByMonth).map(
    ([month, receipts]) => {
      const total = receipts.reduce((sum, r) => sum + r.totalAmount, 0)
      const [year, monthNum] = month.split('-')
      const date = new Date(parseInt(year), parseInt(monthNum) - 1)
      const monthName = date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })

      return {
        key: month,
        name: monthName,
        total,
        receipts,
        isCurrentMonth:
          month ===
          `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}`,
      }
    }
  )

  // Total général
  const grandTotal = payments.reduce((sum, r) => sum + r.totalAmount, 0)

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
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">
            Mes revenus locatifs
          </h1>
          <p className="text-gray-500 mt-1">
            Historique de tous les paiements reçus
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Total général */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white mb-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 mb-2">Total perçu</p>
              <p className="text-5xl font-bold">{formatPrice(grandTotal)}</p>
              <p className="text-emerald-100 mt-2">
                {payments.length} paiement{payments.length > 1 ? 's' : ''}{' '}
                confirmé{payments.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">💰</span>
            </div>
          </div>
        </div>

        {/* Liste par mois */}
        {monthlyTotals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun paiement
            </h2>
            <p className="text-gray-500">
              Les paiements confirmés apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthlyTotals.map(month => (
              <MonthAccordion
                key={month.key}
                month={month}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant client pour l'accordéon avec montant dans le header
function MonthAccordion({
  month,
  formatPrice,
  formatDate,
}: {
  month: {
    key: string
    name: string
    total: number
    receipts: Array<{
      id: string
      totalAmount: number
      paidAt: Date | null
      lease: {
        property: { title: string; city: string }
        tenant: { firstName: string; lastName: string }
      }
    }>
    isCurrentMonth: boolean
  }
  formatPrice: (amount: number) => string
  formatDate: (date: Date) => string
}) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden ${
        month.isCurrentMonth ? 'border-emerald-200' : 'border-gray-200'
      }`}
    >
      <details className="group" open={month.isCurrentMonth}>
        <summary
          className={`flex items-center justify-between p-5 cursor-pointer list-none ${
            month.isCurrentMonth
              ? 'bg-emerald-50 hover:bg-emerald-100'
              : 'bg-gray-50 hover:bg-gray-100'
          } transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                month.isCurrentMonth
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <span>{month.isCurrentMonth ? '📅' : '📁'}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {month.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {month.isCurrentMonth && (
                  <span className="text-xs px-2 py-0.5 bg-emerald-500 text-white rounded-full">
                    En cours
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {month.receipts.length} paiement
                {month.receipts.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p
              className={`text-2xl font-bold ${
                month.isCurrentMonth ? 'text-emerald-600' : 'text-gray-700'
              }`}
            >
              {formatPrice(month.total)}
            </p>
            <svg
              className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </summary>

        <div className="p-4 space-y-3 bg-white">
          {month.receipts.map(payment => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    month.isCurrentMonth ? 'bg-emerald-100' : 'bg-gray-200'
                  }`}
                >
                  <span>✅</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {payment.lease.tenant.firstName}{' '}
                    {payment.lease.tenant.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {payment.lease.property.title} •{' '}
                    {payment.paidAt && formatDate(payment.paidAt)}
                  </p>
                </div>
              </div>
              <p
                className={`font-semibold ${
                  month.isCurrentMonth ? 'text-emerald-600' : 'text-gray-700'
                }`}
              >
                {formatPrice(payment.totalAmount)}
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
