'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface CoTenant {
  tenant: {
    id: string
    firstName: string
    lastName: string
  }
}

interface Receipt {
  id: string
  month: number
  year: number
  rentAmount: number
  charges: number | null
  totalAmount: number
  paymentMethod: string | null
  paidAt: Date | null
  createdAt: Date
  lease: {
    property: {
      title: string
      address: string
      city: string
      postalCode: string
      owner: {
        firstName: string
        lastName: string
        address: string | null
      }
    }
    tenant: {
      firstName: string
      lastName: string
      address: string | null
    }
    // 🆕 Colocataires
    tenants?: CoTenant[]
  }
}

interface ReceiptPDFProps {
  receipt: Receipt
}

export default function ReceiptPDF({ receipt }: ReceiptPDFProps) {
  const [loading, setLoading] = useState(false)

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

  // 🆕 Construire la liste des noms des locataires
  const getTenantNames = () => {
    if (receipt.lease.tenants && receipt.lease.tenants.length > 0) {
      return receipt.lease.tenants
        .map(t => `${t.tenant.firstName} ${t.tenant.lastName}`)
        .join(', ')
    }
    return `${receipt.lease.tenant.firstName} ${receipt.lease.tenant.lastName}`
  }

  // 🆕 Label singulier/pluriel
  const getTenantLabel = () => {
    if (receipt.lease.tenants && receipt.lease.tenants.length > 1) {
      return 'Locataires'
    }
    return 'Locataire'
  }

  const handleDownload = async () => {
    setLoading(true)

    const tenantNames = getTenantNames()
    const tenantLabel = getTenantLabel()
    const ownerFullName = `${receipt.lease.property.owner.firstName} ${receipt.lease.property.owner.lastName}`

    try {
      // Générer le HTML de la quittance
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Quittance ${getMonthName(receipt.month)} ${receipt.year}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 24px; margin-bottom: 8px; }
            .header p { color: #666; }
            .parties { display: flex; gap: 40px; margin-bottom: 40px; }
            .party { flex: 1; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .party-label { font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; }
            .party-name { font-weight: bold; margin-bottom: 4px; }
            .party-address { font-size: 14px; color: #666; }
            .details { border-top: 1px solid #ddd; padding-top: 30px; margin-bottom: 30px; }
            .details h3 { margin-bottom: 20px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .detail-total { border-top: 2px solid #333; padding-top: 12px; margin-top: 12px; font-weight: bold; font-size: 18px; }
            .attestation { background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 30px; line-height: 1.6; }
            .footer { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 40px; }
            .signature { text-align: right; }
            .signature-label { margin-top: 40px; padding-top: 10px; border-top: 1px solid #333; }
            .signature-name { font-weight: bold; color: #333; font-size: 14px; margin-top: 8px; }
            .document-info { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QUITTANCE DE LOYER</h1>
            <p>${getMonthName(receipt.month)} ${receipt.year}</p>
          </div>

          <div class="parties">
            <div class="party">
              <p class="party-label">Bailleur</p>
              <p class="party-name">${ownerFullName}</p>
              ${receipt.lease.property.owner.address ? `<p class="party-address">${receipt.lease.property.owner.address}</p>` : ''}
            </div>
            <div class="party">
              <p class="party-label">${tenantLabel}</p>
              <p class="party-name">${tenantNames}</p>
              <p class="party-address">${receipt.lease.property.address}</p>
              <p class="party-address">${receipt.lease.property.postalCode} ${receipt.lease.property.city}</p>
            </div>
          </div>

          <div class="details">
            <h3>Détail du paiement</h3>
            <div class="detail-row">
              <span>Loyer</span>
              <span>${formatPrice(receipt.rentAmount)}</span>
            </div>
            ${receipt.charges && receipt.charges > 0 ? `
            <div class="detail-row">
              <span>Charges</span>
              <span>${formatPrice(receipt.charges)}</span>
            </div>
            ` : ''}
            <div class="detail-row detail-total">
              <span>Total</span>
              <span>${formatPrice(receipt.totalAmount)}</span>
            </div>
          </div>

          <div class="attestation">
            <p>
              Je soussigné(e) <strong>${ownerFullName}</strong>,
              propriétaire du logement situé au <strong>${receipt.lease.property.address}, ${receipt.lease.property.postalCode} ${receipt.lease.property.city}</strong>,
              atteste avoir reçu de <strong>${tenantNames}</strong> la somme
              de <strong>${formatPrice(receipt.totalAmount)}</strong> au titre du loyer et des charges pour la période
              du <strong>1er ${getMonthName(receipt.month).toLowerCase()} ${receipt.year}</strong> au
              <strong>${new Date(receipt.year, receipt.month, 0).getDate()} ${getMonthName(receipt.month).toLowerCase()} ${receipt.year}</strong>.
            </p>
          </div>

          <div class="footer">
            <div>
              <p>Mode de paiement : ${receipt.paymentMethod === 'virement' ? 'Virement bancaire' : receipt.paymentMethod === 'cheque' ? 'Chèque' : 'Espèces'}</p>
              ${receipt.paidAt ? `<p>Date de paiement : ${formatDate(receipt.paidAt)}</p>` : ''}
            </div>
            <div class="signature">
              <p>Fait le ${formatDate(receipt.createdAt)}</p>
              <div class="signature-label">
                <p>Signature du bailleur</p>
                <p class="signature-name">${ownerFullName}</p>
              </div>
            </div>
          </div>

          <div class="document-info">
            <p>Document généré électroniquement • Quittance de loyer conforme à l'article 21 de la loi n°89-462 du 6 juillet 1989</p>
          </div>
        </body>
        </html>
      `

      // Créer un Blob et télécharger
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Ouvrir dans un nouvel onglet pour impression/PDF
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }

      toast.success('Quittance prête à imprimer !')
    } catch (error) {
      toast.error('Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <span>🖨️</span>
      )}
      Imprimer / PDF
    </button>
  )
}