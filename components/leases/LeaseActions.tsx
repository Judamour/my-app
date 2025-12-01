// components/leases/LeaseActions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface LeaseActionsProps {
  leaseId: string
  status: string
  role: 'owner' | 'tenant'
  inventoryInDone?: boolean
  inventoryInAt?: Date | null
  inventoryOutDone?: boolean
  inventoryOutAt?: Date | null
}

export default function LeaseActions({ 
  leaseId, 
  status, 
  role,
  inventoryInDone = false,
  inventoryInAt = null,
  inventoryOutDone = false,
  inventoryOutAt = null,
}: LeaseActionsProps) {
  const [loading, setLoading] = useState(false)
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [inDone, setInDone] = useState(inventoryInDone)
  const [outDone, setOutDone] = useState(inventoryOutDone)
  const [showInventoryOutModal, setShowInventoryOutModal] = useState(false)
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

  const handleInventory = async (type: 'in' | 'out') => {
    setInventoryLoading(true)

    try {
      const response = await fetch(`/api/leases/${leaseId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur')
      }

      if (type === 'in') {
        setInDone(true)
      } else {
        setOutDone(true)
        setShowInventoryOutModal(false)
      }
      
      toast.success(`État des lieux ${type === 'in' ? "d'entrée" : 'de sortie'} confirmé !`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setInventoryLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* ========== BAIL EN ATTENTE ========== */}
      {status === 'PENDING' && role === 'owner' && (
        <>
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-orange-700">
              ⏳ En attente d&apos;activation
            </p>
          </div>

          {/* Checkbox état des lieux ENTRÉE */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <label className={`flex items-start gap-3 ${inDone ? '' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={inDone}
                onChange={() => !inDone && handleInventory('in')}
                disabled={inventoryLoading || inDone}
                className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  📋 État des lieux d&apos;entrée effectué
                </p>
                {inDone ? (
                  <p className="text-sm text-emerald-600 mt-1">
                    ✅ Confirmé {inventoryInAt && `le ${formatDate(inventoryInAt)}`}
                  </p>
                ) : (
                  <p className="text-sm text-amber-700 mt-1">
                    ⚠️ Requis avant d&apos;activer le bail
                  </p>
                )}
              </div>
            </label>
            {!inDone && (
              <p className="text-xs text-gray-500 mt-3 ml-8">
                Uploadez le document dans la section Documents.
              </p>
            )}
          </div>

          {/* Bouton Activer - conditionnel */}
          <button
            onClick={() => handleAction('activate')}
            disabled={loading || !inDone}
            className={`w-full py-3 font-medium rounded-xl transition-colors ${
              inDone
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-300'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? '⏳' : '✓'} Activer le bail
          </button>
          {!inDone && (
            <p className="text-xs text-gray-500 text-center">
              Cochez l&apos;état des lieux pour activer
            </p>
          )}
        </>
      )}

      {status === 'PENDING' && role === 'tenant' && (
        <div className="p-4 bg-orange-50 rounded-xl">
          <p className="text-sm text-orange-700 font-medium mb-2">
            ⏳ Bail en attente
          </p>
          <p className="text-sm text-orange-600">
            Le propriétaire doit confirmer l&apos;état des lieux et activer le bail.
          </p>
        </div>
      )}

      {/* ========== BAIL ACTIF ========== */}
      {status === 'ACTIVE' && (
        <>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <p className="text-sm text-emerald-700 font-medium">
              ✅ Bail actif
            </p>
          </div>

          {/* Afficher état des lieux entrée confirmé */}
          {inDone && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                📋 État des lieux entrée : <span className="text-emerald-600 font-medium">✅ {formatDate(inventoryInAt)}</span>
              </p>
            </div>
          )}

          {role === 'owner' && (
            <>
              {/* Checkbox état des lieux SORTIE - ouvre modal */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <label className={`flex items-start gap-3 ${outDone ? '' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={outDone}
                    onChange={() => !outDone && setShowInventoryOutModal(true)}
                    disabled={inventoryLoading || outDone}
                    className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      📋 État des lieux de sortie effectué
                    </p>
                    {outDone ? (
                      <p className="text-sm text-emerald-600 mt-1">
                        ✅ Confirmé {inventoryOutAt && `le ${formatDate(inventoryOutAt)}`}
                      </p>
                    ) : (
                      <p className="text-sm text-blue-700 mt-1">
                        ⚠️ Requis avant de mettre fin au bail
                      </p>
                    )}
                  </div>
                </label>
                {!outDone && (
                  <p className="text-xs text-gray-500 mt-3 ml-8">
                    Uploadez le document dans la section Documents.
                  </p>
                )}
              </div>

              {/* Bouton Terminer - conditionnel */}
              <button
                onClick={() => handleAction('end')}
                disabled={loading || !outDone}
                className={`w-full py-3 font-medium rounded-xl transition-colors ${
                  outDone
                    ? 'border border-red-200 text-red-600 hover:bg-red-50 disabled:bg-gray-100'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? '⏳' : '✗'} Mettre fin au bail
              </button>
              {!outDone && (
                <p className="text-xs text-gray-500 text-center">
                  Cochez l&apos;état des lieux de sortie pour terminer
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* ========== BAIL TERMINÉ ========== */}
      {status === 'ENDED' && (
        <div className="space-y-3">
          <div className="p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">
              📋 Bail terminé
            </p>
          </div>
          
          {/* Récap états des lieux */}
          {(inDone || outDone) && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-1">
              {inDone && (
                <p className="text-sm text-gray-600">
                  📋 Entrée : <span className="text-emerald-600">✅ {formatDate(inventoryInAt)}</span>
                </p>
              )}
              {outDone && (
                <p className="text-sm text-gray-600">
                  📋 Sortie : <span className="text-emerald-600">✅ {formatDate(inventoryOutAt)}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== MODAL CONFIRMATION ÉTAT DES LIEUX SORTIE ========== */}
      {showInventoryOutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirmer l&apos;état des lieux de sortie ?
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  Cette action est <strong>irréversible</strong>.
                </p>
                <p className="text-sm">
                  Une fois confirmé, vous pourrez mettre fin au bail définitivement. Assurez-vous que :
                </p>
                <ul className="text-sm text-left mt-3 space-y-2 bg-gray-50 rounded-lg p-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>L&apos;état des lieux de sortie a bien été réalisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>Le document est uploadé dans la section Documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>Le locataire a rendu les clés</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowInventoryOutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleInventory('out')}
                disabled={inventoryLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {inventoryLoading ? '⏳ Confirmation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}