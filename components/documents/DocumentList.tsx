'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import LoadingWrapper from '@/components/ui/LoadingWrapper'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

interface Document {
  id: string
  type: string
  name: string
  url: string
  size: number | null
  owner: {
    id: string
    firstName: string
    lastName: string
  }
}

interface DocumentListProps {
  leaseId: string
  refreshTrigger?: number
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  ID_CARD: '🪪 Pièce d\'identité',
  PAYSLIP: '💰 Fiche de paie',
  CONTRACT: '📄 Contrat',
  INVENTORY: '📋 État des lieux',
  RECEIPT: '🧾 Quittance',
  PROOF_ADDRESS: '🏠 Justificatif domicile',
  TAX_NOTICE: '💼 Avis imposition',
  INSURANCE: '🛡️ Assurance',
  OTHER: '📎 Autre',
}

export default function DocumentList({
  leaseId,
  refreshTrigger,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [leaseId, refreshTrigger])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents?leaseId=${leaseId}`)
      const result = await response.json()

      if (response.ok) {
        setDocuments(result.data)
      }
    } catch (error) {
      console.error('Load documents error:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Document supprimé')
        loadDocuments()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const mb = bytes / 1024 / 1024
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📁</span>
        </div>
        <p className="font-medium text-gray-900">Aucun document</p>
        <p className="text-sm text-gray-500 mt-2">
          Uploadez des documents pour ce bail
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-500">
                  {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{doc.name}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Uploadé par {doc.owner.firstName}</span>
                <span>•</span>
                <span>{formatSize(doc.size)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              
           <a     href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Voir
              </a>
              <Button
                onClick={() => handleDelete(doc.id, doc.name)}
                loading={deleting === doc.id}
                variant="danger"
                size="sm"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}