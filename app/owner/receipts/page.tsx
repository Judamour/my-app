import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CreateReceiptButton from '@/components/receipts/CreateReceiptButton'

export default async function OwnerReceiptsPage() {
  const session = await requireOwner()

  // Récupérer les baux actifs pour créer des quittances
  const activeLeases = await prisma.lease.findMany({
    where: {
      property: { ownerId: session.user.id },
      status: 'ACTIVE'
    },
    include: {
      property: { select: { title: true } },
      tenant: { select: { firstName: true, lastName: true } }
    }
  })

  // Récupérer toutes les quittances
  const receipts = await prisma.receipt.findMany({
    where: {
      lease: {
        property: { ownerId: session.user.id }
      }
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Quittances de loyer
              </h1>
              <p className="text-gray-500 mt-1">
                {receipts.length} quittance{receipts.length > 1 ? 's' : ''} générée{receipts.length > 1 ? 's' : ''}
              </p>
            </div>
            {activeLeases.length > 0 && (
              <CreateReceiptButton leases={activeLeases} />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Pas de baux actifs */}
        {activeLeases.length === 0 && receipts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📄</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun bail actif
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Vous devez avoir un bail actif pour générer des quittances de loyer.
            </p>
            <Link
              href="/owner/leases"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Voir mes baux
            </Link>
          </div>
        )}

        {/* Liste des quittances */}
        {receipts.length > 0 && (
          <div className="space-y-4">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Infos */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🧾</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getMonthName(receipt.month)} {receipt.year}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {receipt.lease.property.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Locataire : {receipt.lease.tenant.firstName} {receipt.lease.tenant.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Montant & Actions */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatPrice(receipt.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {receipt.paymentMethod === 'virement' && '💳 Virement'}
                        {receipt.paymentMethod === 'cheque' && '📝 Chèque'}
                        {receipt.paymentMethod === 'especes' && '💵 Espèces'}
                      </p>
                    </div>
                    <Link
                      href={`/owner/receipts/${receipt.id}`}
                      className="px-4 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-sm"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Baux actifs sans quittances */}
        {activeLeases.length > 0 && receipts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Prêt à générer des quittances
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Vous avez {activeLeases.length} bail{activeLeases.length > 1 ? 's' : ''} actif{activeLeases.length > 1 ? 's' : ''}. 
              Générez votre première quittance de loyer.
            </p>
            <CreateReceiptButton leases={activeLeases} />
          </div>
        )}
      </div>
    </div>
  )
}