'use client'

import { useState, useEffect } from 'react'

interface Document {
  id: string
  type: string
  name: string
  createdAt: Date
}

interface DocumentShareModalProps {
  userId: string
  propertyTitle: string
  onConfirm: (selectedDocumentIds: string[]) => void
  onCancel: () => void
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: string; required?: boolean }> = {
  'ID_CARD': { label: 'Pièce d\'identité', icon: '🆔', required: true },
  'PAYSLIP': { label: 'Fiche de paie', icon: '💰', required: true },
  'WORK_CONTRACT': { label: 'Contrat de travail', icon: '📑' },
  'PROOF_ADDRESS': { label: 'Justificatif de domicile', icon: '🏠', required: true },
  'TAX_NOTICE': { label: 'Avis d\'imposition', icon: '📊' },
  'BANK_STATEMENT': { label: 'RIB', icon: '🏦' },
  'GUARANTOR_ID': { label: 'Pièce d\'identité garant', icon: '👤' },
  'GUARANTOR_INCOME': { label: 'Revenus garant', icon: '💼' },
  'INSURANCE': { label: 'Assurance habitation', icon: '🛡️' },
  'OTHER': { label: 'Autre document', icon: '📎' },
}

export default function DocumentShareModal({
  userId,
  propertyTitle,
  onConfirm,
  onCancel,
}: DocumentShareModalProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/documents/profile/${userId}`)
        const data = await response.json()
        setDocuments(data.documents || [])
        
        // Pré-sélectionner tous les documents
        setSelectedIds((data.documents || []).map((d: Document) => d.id))
      } catch (error) {
        console.error('Erreur fetch documents:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDocuments()
  }, [userId])

  const toggleDocument = (docId: string) => {
    setSelectedIds(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const selectAll = () => {
    setSelectedIds(documents.map(d => d.id))
  }

  const deselectAll = () => {
    setSelectedIds([])
  }

  const getTypeInfo = (type: string) => {
    return DOCUMENT_TYPE_LABELS[type] || { label: type, icon: '📄' }
  }

  // Grouper par type
  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = []
    acc[doc.type].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            📄 Documents à partager
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Pour votre candidature à <span className="font-medium">{propertyTitle}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📭</span>
              <p className="text-gray-600 mt-2">Aucun document dans votre profil</p>
              <p className="text-sm text-gray-500 mt-1">
                Ajoutez des documents dans votre profil pour les partager.
              </p>
            </div>
          ) : (
            <>
              {/* Actions rapides */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Tout sélectionner
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Tout désélectionner
                </button>
              </div>

              {/* Liste documents */}
              <div className="space-y-3">
                {Object.entries(groupedDocuments).map(([type, docs]) => {
                  const typeInfo = getTypeInfo(type)
                  return (
                    <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 flex items-center gap-2">
                        <span>{typeInfo.icon}</span>
                        <span className="font-medium text-gray-700">{typeInfo.label}</span>
                        <span className="text-xs text-gray-500">({docs.length})</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {docs.map(doc => (
                          <label
                            key={doc.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(doc.id)}
                              onChange={() => toggleDocument(doc.id)}
                              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Ajouté le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Info sécurité */}
        <div className="px-6 py-4 bg-green-50 border-t border-green-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <p className="text-sm font-medium text-green-800">
                Vos documents sont protégés
              </p>
              <p className="text-xs text-green-700 mt-1">
                Seul le propriétaire de ce bien pourra consulter les documents sélectionnés, 
                pendant la durée de votre candidature et du bail éventuel.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(selectedIds)}
            disabled={documents.length > 0 && selectedIds.length === 0}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Envoyer ma candidature
            {selectedIds.length > 0 && (
              <span className="ml-2 text-blue-200">
                ({selectedIds.length} doc{selectedIds.length > 1 ? 's' : ''})
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}