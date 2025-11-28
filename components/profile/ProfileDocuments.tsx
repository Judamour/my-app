'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Document {
  id: string
  type: string
  name: string
  url: string
  size: number | null
  mimeType: string | null
  verified: boolean
  createdAt: Date
}

const DOCUMENT_TYPES = [
  { value: 'ID_CARD', label: 'Pièce d\'identité', icon: '🆔', description: 'Carte d\'identité ou passeport' },
  { value: 'PAYSLIP', label: 'Fiche de paie', icon: '💰', description: '3 dernières fiches de paie' },
  { value: 'WORK_CONTRACT', label: 'Contrat de travail', icon: '📑', description: 'Contrat en cours' },
  { value: 'PROOF_ADDRESS', label: 'Justificatif de domicile', icon: '🏠', description: 'Moins de 3 mois' },
  { value: 'TAX_NOTICE', label: 'Avis d\'imposition', icon: '📊', description: 'Dernier avis' },
  { value: 'BANK_STATEMENT', label: 'RIB', icon: '🏦', description: 'Relevé d\'identité bancaire' },
  { value: 'GUARANTOR_ID', label: 'Pièce d\'identité garant', icon: '👤', description: 'Si garant' },
  { value: 'GUARANTOR_INCOME', label: 'Revenus garant', icon: '💼', description: 'Justificatifs garant' },
  { value: 'INSURANCE', label: 'Assurance habitation', icon: '🛡️', description: 'Attestation' },
  { value: 'OTHER', label: 'Autre document', icon: '📎', description: 'Autre justificatif' },
]

export default function ProfileDocuments({ userId }: { userId: string }) {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [expandedType, setExpandedType] = useState<string | null>(null)

  // Charger les documents
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/profile/${userId}`)
      if (!response.ok) throw new Error('Erreur de chargement')
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      toast.error('Impossible de charger les documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (type: string, file: File) => {
    if (!file) return

    // Validation taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10MB)')
      return
    }

    // Validation type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez PDF, JPG ou PNG')
      return
    }

    setUploading(type)

    try {
      // 1. Upload vers Supabase
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'documents')
      formData.append('folder', `profile/${userId}`)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Erreur d\'upload')
      }

      const { url } = await uploadResponse.json()

      // 2. Créer l'entrée en DB
      const createResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name: file.name,
          url,
          size: file.size,
          mimeType: file.type,
          propertyId: null,
          leaseId: null,
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || 'Erreur de sauvegarde')
      }

      toast.success('Document ajouté avec succès')
      fetchDocuments()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur d\'upload')
    } finally {
      setUploading(null)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Supprimer ce document ?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur de suppression')
      }

      toast.success('Document supprimé')
      fetchDocuments()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de suppression')
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getDocumentsByType = (type: string) => {
    return documents.filter((d) => d.type === type)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-medium text-blue-900">À propos de vos documents</p>
            <p className="text-sm text-blue-700 mt-1">
              Ces documents sont visibles uniquement par vous et les propriétaires auxquels vous candidatez. 
              Formats acceptés : PDF, JPG, PNG (max 10MB).
            </p>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{documents.length}</p>
          <p className="text-sm text-gray-600 mt-1">
            Document{documents.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {documents.filter((d) => d.verified).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Vérifié{documents.filter((d) => d.verified).length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {new Set(documents.map((d) => d.type)).size}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Type{new Set(documents.map((d) => d.type)).size > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Liste des types de documents */}
      <div className="space-y-3">
        {DOCUMENT_TYPES.map((docType) => {
          const docsOfType = getDocumentsByType(docType.value)
          const isExpanded = expandedType === docType.value
          const hasDocuments = docsOfType.length > 0

          return (
            <div
              key={docType.value}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedType(isExpanded ? null : docType.value)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-2xl">{docType.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{docType.label}</p>
                    <p className="text-xs text-gray-500">{docType.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasDocuments && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {docsOfType.length} doc{docsOfType.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
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
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="p-4 bg-white border-t border-gray-200">
                  {/* Documents existants */}
                  {docsOfType.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {docsOfType.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <span className="text-lg">📄</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {doc.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{formatFileSize(doc.size)}</span>
                                <span>•</span>
                                <span>
                                  {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                                {doc.verified && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-600 font-medium">
                                      ✓ Vérifié
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            
                          <a    href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ouvrir"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </a>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload nouveau document */}
                  <label
                    className={`block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all ${
                      uploading === docType.value ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading === docType.value ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Upload en cours...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📤</span>
                        <span className="font-medium text-gray-900">
                          Ajouter {docType.label.toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          PDF, JPG, PNG • Max 10MB
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(docType.value, file)
                        e.target.value = ''
                      }}
                      disabled={uploading === docType.value}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}