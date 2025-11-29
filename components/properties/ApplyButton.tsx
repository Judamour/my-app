'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface ApplyButtonProps {
  propertyId: string
  propertyTitle?: string
}

interface Document {
  id: string
  type: string
  name: string
  createdAt: string
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  'ID_CARD': { label: 'Pièce d\'identité', icon: '🆔' },
  'PAYSLIP': { label: 'Fiche de paie', icon: '💰' },
  'WORK_CONTRACT': { label: 'Contrat de travail', icon: '📑' },
  'PROOF_ADDRESS': { label: 'Justificatif de domicile', icon: '🏠' },
  'TAX_NOTICE': { label: 'Avis d\'imposition', icon: '📊' },
  'BANK_STATEMENT': { label: 'RIB', icon: '🏦' },
  'GUARANTOR_ID': { label: 'Pièce d\'identité garant', icon: '👤' },
  'GUARANTOR_INCOME': { label: 'Revenus garant', icon: '💼' },
  'INSURANCE': { label: 'Assurance habitation', icon: '🛡️' },
  'OTHER': { label: 'Autre document', icon: '📎' },
}

export default function ApplyButton({ propertyId, propertyTitle }: ApplyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<'message' | 'documents'>('message')
  const [message, setMessage] = useState('')
  const [hasApplied, setHasApplied] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const router = useRouter()

  // Charger les documents quand on passe à l'étape 2
  useEffect(() => {
    if (step === 'documents' && documents.length === 0) {
      fetchDocuments()
    }
  }, [step])

 const fetchDocuments = async () => {
  setLoadingDocs(true)
  try {
    // Utiliser la route qui fonctionne déjà
    const response = await fetch('/api/user/documents')
    const data = await response.json()
    const docs = data.documents || []
    setDocuments(docs)
    setSelectedDocIds(docs.map((d: Document) => d.id))
  } catch (error) {
    console.error('Erreur fetch documents:', error)
  } finally {
    setLoadingDocs(false)
  }
}

  const toggleDocument = (docId: string) => {
    setSelectedDocIds(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const selectAll = () => setSelectedDocIds(documents.map(d => d.id))
  const deselectAll = () => setSelectedDocIds([])

  const handleNextStep = () => {
    setStep('documents')
  }

  const handlePrevStep = () => {
    setStep('message')
  }

  const handleApply = async () => {
    if (loading || hasApplied) return
    
    setLoading(true)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          message: message || null,
          sharedDocumentIds: selectedDocIds,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la candidature')
      }

      setHasApplied(true)
      
      const docCount = selectedDocIds.length
      if (docCount > 0) {
        toast.success(`Candidature envoyée avec ${docCount} document${docCount > 1 ? 's' : ''} !`)
      } else {
        toast.success('Candidature envoyée avec succès !')
      }
      
      setShowModal(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setShowModal(false)
      setStep('message')
    }
  }

  const getTypeInfo = (type: string) => {
    return DOCUMENT_TYPE_LABELS[type] || { label: type, icon: '📄' }
  }

  // Grouper documents par type
  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = []
    acc[doc.type].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  // Si déjà postulé
  if (hasApplied) {
    return (
      <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
        <p className="font-medium text-emerald-700 flex items-center justify-center gap-2">
          <span>✅</span>
          Candidature envoyée
        </p>
        <p className="text-sm text-emerald-600 mt-1">
          Le propriétaire va étudier votre profil
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Bouton principal */}
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-xl hover:from-rose-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 transition-all"
      >
        Postuler à ce bien
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50 z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Progress indicator */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${step === 'message' ? 'text-gray-900' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === 'message' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <span className="font-medium text-sm hidden sm:inline">Message</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 rounded">
                  <div className={`h-full bg-gray-900 rounded transition-all ${
                    step === 'documents' ? 'w-full' : 'w-0'
                  }`} />
                </div>
                <div className={`flex items-center gap-2 ${step === 'documents' ? 'text-gray-900' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === 'documents' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className="font-medium text-sm hidden sm:inline">Documents</span>
                </div>
              </div>
            </div>

            {/* ÉTAPE 1 : MESSAGE */}
            {step === 'message' && (
              <>
                <div className="p-6 overflow-y-auto flex-1">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Envoyer ma candidature
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Étape 1/2 : Présentez-vous au propriétaire
                    </p>
                  </div>

                  {/* Message optionnel */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message au propriétaire
                      <span className="text-gray-400 font-normal ml-2">(optionnel)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none disabled:bg-gray-50"
                      placeholder="Présentez-vous brièvement, expliquez pourquoi ce bien vous intéresse..."
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700 flex items-start gap-2">
                      <span>💡</span>
                      <span>Un message personnalisé augmente vos chances d&apos;être sélectionné !</span>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </>
            )}

            {/* ÉTAPE 2 : DOCUMENTS */}
            {step === 'documents' && (
              <>
                <div className="p-6 overflow-y-auto flex-1">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Partager vos documents
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Étape 2/2 : Sélectionnez les documents à partager
                    </p>
                  </div>

                  {loadingDocs ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full mx-auto"></div>
                      <p className="text-gray-500 mt-2">Chargement...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl block mb-3">📭</span>
                      <p className="text-gray-600 font-medium mb-2">
                        Aucun document dans votre profil
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Ajoutez des documents pour renforcer votre candidature
                      </p>
                      <Link
                        href="/profile/edit?tab=documents"
                        className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Ajouter des documents
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Actions rapides */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
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
                        <span className="text-sm text-gray-500">
                          {selectedDocIds.length}/{documents.length} sélectionné{selectedDocIds.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Liste documents par type */}
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {Object.entries(groupedDocuments).map(([type, docs]) => {
                          const typeInfo = getTypeInfo(type)
                          const allSelected = docs.every(d => selectedDocIds.includes(d.id))
                          
                          return (
                            <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* Type header */}
                              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span>{typeInfo.icon}</span>
                                  <span className="font-medium text-gray-700 text-sm">{typeInfo.label}</span>
                                  <span className="text-xs text-gray-400">({docs.length})</span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (allSelected) {
                                      setSelectedDocIds(prev => prev.filter(id => !docs.map(d => d.id).includes(id)))
                                    } else {
                                      setSelectedDocIds(prev => [...new Set([...prev, ...docs.map(d => d.id)])])
                                    }
                                  }}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {allSelected ? 'Désélectionner' : 'Sélectionner'}
                                </button>
                              </div>
                              
                              {/* Documents */}
                              <div className="divide-y divide-gray-100">
                                {docs.map(doc => (
                                  <label
                                    key={doc.id}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedDocIds.includes(doc.id)}
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
                        Seul ce propriétaire pourra consulter les documents sélectionnés, 
                        pendant la durée de votre candidature et du bail éventuel.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-xl hover:from-rose-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Envoi...
                      </span>
                    ) : (
                      <>
                        Envoyer ma candidature
                        {selectedDocIds.length > 0 && (
                          <span className="ml-1 opacity-80">
                            ({selectedDocIds.length} doc{selectedDocIds.length > 1 ? 's' : ''})
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
