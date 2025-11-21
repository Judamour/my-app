import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ReceiptPDF from '@/components/receipts/ReceiptPDF'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenantReceiptDetailPage({ params }: PageProps) {
  const session = await requireAuth()
  const { id } = await params

  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      lease: {
        include: {
          property: {
            select: {
              title: true,
              address: true,
              city: true,
              postalCode: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                  address: true,
                }
              }
            }
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              address: true,
            }
          }
        }
      }
    }
  })

  if (!receipt) {
    notFound()
  }

  // Vérifier que c'est le locataire
  if (receipt.lease.tenant.id !== session.user.id) {
    redirect('/tenant/receipts')
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
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/tenant/receipts"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mes quittances
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Quittance {getMonthName(receipt.month)} {receipt.year}
          </h1>
          <ReceiptPDF receipt={receipt} />
        </div>

        {/* Quittance */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* En-tête */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              QUITTANCE DE LOYER
            </h2>
            <p className="text-gray-500">
              {getMonthName(receipt.month)} {receipt.year}
            </p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Bailleur */}
            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">BAILLEUR</p>
              <p className="font-semibold text-gray-900">
                {receipt.lease.property.owner.firstName} {receipt.lease.property.owner.lastName}
              </p>
              {receipt.lease.property.owner.address && (
                <p className="text-sm text-gray-600 mt-1">
                  {receipt.lease.property.owner.address}
                </p>
              )}
            </div>

            {/* Locataire */}
            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">LOCATAIRE</p>
              <p className="font-semibold text-gray-900">
                {receipt.lease.tenant.firstName} {receipt.lease.tenant.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {receipt.lease.property.address}
              </p>
              <p className="text-sm text-gray-600">
                {receipt.lease.property.postalCode} {receipt.lease.property.city}
              </p>
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Détail du paiement</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Loyer</span>
                <span className="font-medium">{formatPrice(receipt.rentAmount)}</span>
              </div>
              {receipt.charges && receipt.charges > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Charges</span>
                  <span className="font-medium">{formatPrice(receipt.charges)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">{formatPrice(receipt.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Attestation */}
          <div className="bg-emerald-50 rounded-xl p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Je soussigné(e) <strong>{receipt.lease.property.owner.firstName} {receipt.lease.property.owner.lastName}</strong>, 
              propriétaire du logement situé au <strong>{receipt.lease.property.address}, {receipt.lease.property.postalCode} {receipt.lease.property.city}</strong>, 
              atteste avoir reçu de <strong>{receipt.lease.tenant.firstName} {receipt.lease.tenant.lastName}</strong> la somme 
              de <strong>{formatPrice(receipt.totalAmount)}</strong> au titre du loyer et des charges pour la période 
              du <strong>1er {getMonthName(receipt.month).toLowerCase()} {receipt.year}</strong> au{' '}
              <strong>{new Date(receipt.year, receipt.month, 0).getDate()} {getMonthName(receipt.month).toLowerCase()} {receipt.year}</strong>.
            </p>
          </div>

          {/* Pied de page */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-sm text-gray-500">
            <div>
              <p>Mode de paiement : {receipt.paymentMethod === 'virement' ? 'Virement bancaire' : receipt.paymentMethod === 'cheque' ? 'Chèque' : 'Espèces'}</p>
              {receipt.paidAt && (
                <p>Date de paiement : {formatDate(receipt.paidAt)}</p>
              )}
            </div>
            <div className="text-right">
              <p>Fait le {formatDate(receipt.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-gray-400 mt-6">
          🔒 Document officiel • Conservez cette quittance pour vos démarches administratives
        </p>
      </div>
    </div>
  )
}