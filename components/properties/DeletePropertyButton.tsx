// components/properties/DeletePropertyButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface DeletePropertyButtonProps {
  propertyId: string
  propertyTitle: string
  isAvailable: boolean
}

export default function DeletePropertyButton({
  propertyId,
  propertyTitle,
  isAvailable
}: DeletePropertyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      // ✅ Succès
      toast.success('Propriété supprimée avec succès')
      
      // Rediriger vers la liste
      router.push('/owner/properties')
      router.refresh()
      
    } catch (error) {
      // ❌ Erreur
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
      setIsDeleting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isAvailable}
        className={`
          px-6 py-3 
          rounded-lg font-medium
          ${
            isAvailable
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
        title={
          isAvailable
            ? 'Supprimer ce bien'
            : 'Impossible de supprimer un bien loué'
        }
      >
        Supprimer
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer cette propriété ?"
        message={`Êtes-vous sûr de vouloir supprimer "${propertyTitle}" ? Cette action est irréversible.`}
        confirmText="Oui, supprimer"
        cancelText="Annuler"
        isLoading={isDeleting}
      />
    </>
  )
}