'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Tenant {
  id: string
  tenantId: string
  isPrimary: boolean
  share: number
  joinedAt: string
  tenant: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

interface ColocationManagerProps {
  leaseId: string
  isOwner: boolean
  monthlyRent: number
}

export default function ColocationManager({
  leaseId,
  isOwner,
  monthlyRent,
}: ColocationManagerProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingShares, setEditingShares] = useState(false)
  const [tempShares, setTempShares] = useState<Record<string, number>>({})
  const [removeModal, setRemoveModal] = useState<{
    isOpen: boolean
    tenantId: string
    name: string
  }>({ isOpen: false, tenantId: '', name: '' })
  const [removing, setRemoving] = useState(false)

  // Charger les colocataires
  useEffect(() => {
    fetchTenants()
  }, [leaseId])

  const fetchTenants = async () => {
    try {
      const res = await fetch(`/api/leases/${leaseId}/tenants`)
      const data = await res.json()
      if (res.ok) {
        setTenants(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement colocataires:', error)
    } finally {
      setLoading(false)
    }
  }

  // Ajouter un colocataire avec recalcul automatique
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)

    try {
      // Calculer la part égale pour tous
      const newTenantCount = tenants.length + 1
      const equalShare = Math.floor(100 / newTenantCount)

      const res = await fetch(`/api/leases/${leaseId}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail, share: equalShare }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur')
      }

      // Recalculer les parts pour les autres
      for (const tenant of tenants) {
        await fetch(`/api/leases/${leaseId}/tenants`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: tenant.tenantId,
            share: equalShare,
          }),
        })
      }

      toast.success(
        `Colocataire ajouté ! Parts recalculées à ${equalShare}% chacun.`
      )
      setShowAddModal(false)
      setAddEmail('')
      fetchTenants()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setAdding(false)
    }
  }

  // Ouvrir la modal de confirmation de suppression
  const openRemoveModal = (tenantId: string, name: string) => {
    setRemoveModal({ isOpen: true, tenantId, name })
  }

  // Fermer la modal de suppression
  const closeRemoveModal = () => {
    setRemoveModal({ isOpen: false, tenantId: '', name: '' })
  }

  // Retirer un colocataire (appelé après confirmation)
  const handleRemove = async () => {
    setRemoving(true)
    try {
      const res = await fetch(
        `/api/leases/${leaseId}/tenants?tenantId=${removeModal.tenantId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Colocataire retiré')
      closeRemoveModal()
      fetchTenants()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setRemoving(false)
    }
  }

  // Changer le principal
  const handleSetPrimary = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/leases/${leaseId}/tenants`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, isPrimary: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Locataire principal modifié')
      fetchTenants()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  // Commencer l'édition des parts
  const startEditingShares = () => {
    const shares: Record<string, number> = {}
    tenants.forEach(t => {
      shares[t.tenantId] = t.share
    })
    setTempShares(shares)
    setEditingShares(true)
  }

  // Sauvegarder les parts
  const saveShares = async () => {
    try {
      for (const [tenantId, share] of Object.entries(tempShares)) {
        await fetch(`/api/leases/${leaseId}/tenants`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId, share }),
        })
      }
      toast.success('Répartition mise à jour !')
      setEditingShares(false)
      fetchTenants()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  // Répartition égale
  const distributeEqually = () => {
    const equalShare = Math.floor(100 / tenants.length)
    const remainder = 100 - equalShare * tenants.length

    const newShares: Record<string, number> = {}
    tenants.forEach((t, index) => {
      // Le premier reçoit le reste pour faire 100%
      newShares[t.tenantId] = equalShare + (index === 0 ? remainder : 0)
    })
    setTempShares(newShares)
  }

  const totalShare = editingShares
    ? Object.values(tempShares).reduce((sum, s) => sum + s, 0)
    : tenants.reduce((sum, t) => sum + t.share, 0)

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-50 rounded-2xl p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Colocataires
              </h2>
              <p className="text-sm text-gray-500">
                {tenants.length}/5 • Répartition : {totalShare}%
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex flex-wrap gap-2">
              {!editingShares ? (
                <>
                  <button
                    onClick={startEditingShares}
                    className="px-3 py-2 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    title="Modifier la répartition"
                  >
                    📊 Répartition
                  </button>
                  {tenants.length < 5 && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      + Ajouter
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={distributeEqually}
                    className="px-3 py-2 text-purple-600 text-sm font-medium rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    ⚖️ Égaliser
                  </button>
                  <button
                    onClick={() => setEditingShares(false)}
                    className="px-3 py-2 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveShares}
                    disabled={totalShare !== 100}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    ✓ Valider
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Alerte répartition */}
        {totalShare !== 100 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <span>⚠️</span>
              La répartition totale est de {totalShare}% (devrait être 100%)
              {!editingShares && isOwner && (
                <button
                  onClick={startEditingShares}
                  className="ml-2 underline font-medium hover:text-amber-800"
                >
                  Corriger
                </button>
              )}
            </p>
          </div>
        )}

        {/* Liste des colocataires */}
        <div className="space-y-3">
          {tenants.map(t => (
            <div
              key={t.id}
              className={`p-4 bg-white rounded-xl border-2 transition-colors ${
                t.isPrimary ? 'border-purple-300' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${
                    t.isPrimary
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}
                >
                  {t.tenant.firstName[0]}
                  {t.tenant.lastName[0]}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">
                      {t.tenant.firstName} {t.tenant.lastName}
                    </p>
                    {t.isPrimary && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        ⭐ Principal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {t.tenant.email}
                  </p>
                </div>

                {/* Part du loyer - Mode édition ou affichage */}
                {editingShares ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      value={tempShares[t.tenantId] || 0}
                      onChange={e =>
                        setTempShares({
                          ...tempShares,
                          [t.tenantId]: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      max="100"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                ) : (
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round((t.share / 100) * monthlyRent)}€
                    </p>
                    <p className="text-xs text-gray-500">{t.share}%</p>
                  </div>
                )}

                {/* Actions (owner only, hors mode édition) */}
                {isOwner && !editingShares && (
                  <div className="relative group">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {!t.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(t.tenantId)}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span>⭐</span>
                          Définir comme principal
                        </button>
                      )}
                      {tenants.length > 1 && (
                        <button
                          onClick={() =>
                            openRemoveModal(
                              t.tenantId,
                              `${t.tenant.firstName} ${t.tenant.lastName}`
                            )
                          }
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <span>🚪</span>
                          Retirer
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-700">
            💡 La répartition est indicative. Le propriétaire reçoit le loyer
            total de {monthlyRent}€.
          </p>
        </div>
      </div>

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Ajouter un colocataire
              </h2>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email du colocataire *
                </label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  placeholder="colocataire@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le colocataire doit avoir un compte sur la plateforme
                </p>
              </div>

              {/* Aperçu nouvelle répartition */}
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm font-medium text-purple-800 mb-2">
                  📊 Nouvelle répartition automatique
                </p>
                <p className="text-sm text-purple-700">
                  Avec {tenants.length + 1} colocataires :{' '}
                  <strong>
                    {Math.floor(100 / (tenants.length + 1))}% chacun
                  </strong>{' '}
                  (~{Math.round(monthlyRent / (tenants.length + 1))}€)
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  Vous pourrez ajuster la répartition après l&apos;ajout
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adding || !addEmail}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {adding ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Ajout...
                    </span>
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={removeModal.isOpen}
        onClose={closeRemoveModal}
        onConfirm={handleRemove}
        title="Retirer un colocataire"
        message={`Êtes-vous sûr de vouloir retirer ${removeModal.name} de la colocation ? Cette personne n'aura plus accès aux informations du bail.`}
        confirmText="Retirer"
        cancelText="Annuler"
        isLoading={removing}
      />
    </>
  )
}
