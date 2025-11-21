'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface LeaseActionsProps {
  leaseId: string
  status: string
  role: 'owner' | 'tenant'
}

export default function LeaseActions({ leaseId, status, role }: LeaseActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'activate' | 'end') => {
    setLoading(true)

    try {
      const response = await fetch(`/api/leases/${leaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success(
        action === 'activate' 
          ? 'Bail activé avec succès !' 
          : 'Bail terminé avec succès !'
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Bail en attente */}
      {status === 'PENDING' && role === 'owner' && (
        <>
          <div className="p-4 bg-orange-50 rounded-xl mb-4">
            <p className="text-sm text-orange-700">
              ⏳ En attente de signature du locataire
            </p>
          </div>
          <button
            onClick={() => handleAction('activate')}
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:bg-gray-300 transition-colors"
          >
            {loading ? '⏳' : '✓'} Activer le bail
          </button>
          <p className="text-xs text-gray-500 text-center">
            Activez le bail une fois le contrat signé
          </p>
        </>
      )}

      {status === 'PENDING' && role === 'tenant' && (
        <div className="p-4 bg-orange-50 rounded-xl">
          <p className="text-sm text-orange-700 font-medium mb-2">
            ⏳ Bail en attente
          </p>
          <p className="text-sm text-orange-600">
            Signez le bail et envoyez-le au propriétaire pour activer la location.
          </p>
        </div>
      )}

      {/* Bail actif */}
      {status === 'ACTIVE' && (
        <>
          <div className="p-4 bg-emerald-50 rounded-xl mb-4">
            <p className="text-sm text-emerald-700 font-medium">
              ✅ Bail actif
            </p>
          </div>

          {role === 'owner' && (
            <>
              <button
                onClick={() => handleAction('end')}
                disabled={loading}
                className="w-full py-3 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 disabled:bg-gray-100 transition-colors"
              >
                {loading ? '⏳' : '✗'} Mettre fin au bail
              </button>
              <p className="text-xs text-gray-500 text-center">
                Terminez le bail à la fin de la location
              </p>
            </>
          )}
        </>
      )}

      {/* Bail terminé */}
      {status === 'ENDED' && (
        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600 font-medium">
            📋 Bail terminé
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Ce bail n&apos;est plus actif.
          </p>
        </div>
      )}
    </div>
  )
}