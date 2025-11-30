'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

interface DocumentUploadProps {
  leaseId: string
  onUploadComplete: () => void
}

const DOCUMENT_TYPES = [
  { value: '', label: '── Documents du bail ──', disabled: true },
  { value: 'INVENTORY_IN', label: '📋 État des lieux entrée' },
  { value: 'INVENTORY_OUT', label: '📋 État des lieux sortie' },
  { value: 'CONTRACT', label: '📄 Contrat de location' },
  { value: 'INSURANCE', label: '🛡️ Assurance habitation' },
  { value: 'PHOTO_ENTRY', label: '📸 Photos entrée' },
  { value: 'PHOTO_EXIT', label: '📸 Photos sortie' },
  { value: '', label: '── Documents personnels ──', disabled: true },
  { value: 'ID_CARD', label: "🪪 Pièce d'identité" },
  { value: 'PAYSLIP', label: '💰 Fiche de paie' },
  { value: 'TAX_NOTICE', label: "💼 Avis d'imposition" },
  { value: 'PROOF_ADDRESS', label: '🏠 Justificatif de domicile' },
  { value: 'OTHER', label: '📎 Autre document' },
]

export default function DocumentUpload({
  leaseId,
  onUploadComplete,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Vérifier la taille (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Fichier trop volumineux (max 10MB)')
        return
      }

      setFile(selectedFile)
      // Pré-remplir le nom avec le nom du fichier
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !type || !name) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('leaseId', leaseId)
      formData.append('type', type)
      formData.append('name', name)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Document uploadé avec succès !')
        // Reset form
        setFile(null)
        setType('')
        setName('')
        // Trigger refresh
        onUploadComplete()
      } else {
        toast.error(result.error || "Erreur lors de l'upload")
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📤 Ajouter un document
      </h3>

      <div className="space-y-4">
        {/* Type de document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de document *
          </label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={uploading}
          >
            <option value="">Sélectionner un type</option>
            {DOCUMENT_TYPES.map((docType, index) => (
              <option
                key={docType.value || `separator-${index}`}
                value={docType.value}
                disabled={docType.disabled}
                className={
                  docType.disabled ? 'font-semibold text-gray-800' : ''
                }
              >
                {docType.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nom du document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du document *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: CNI recto-verso"
            className="text-gray-700  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
          />
        </div>

        {/* Fichier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichier *
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <div className="text-center">
                {file ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl block mb-1">📁</span>
                    <span className="text-sm text-gray-600">
                      Cliquer pour sélectionner un fichier
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, JPG, PNG, DOC (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Bouton upload */}
        <Button
          onClick={handleUpload}
          loading={uploading}
          disabled={!file || !type || !name}
          variant="primary"
          fullWidth
        >
          {uploading ? 'Upload en cours...' : 'Uploader le document'}
        </Button>
      </div>
    </div>
  )
}
