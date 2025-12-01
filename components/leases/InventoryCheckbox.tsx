'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface InventoryCheckboxProps {
  leaseId: string
  type: 'in' | 'out'
  done: boolean
  doneAt: Date | null
  disabled?: boolean
}

export default function InventoryCheckbox({ 
  leaseId, 
  type,
  done, 
  doneAt,
  disabled = false,
}: InventoryCheckboxProps) {
  const [checked, setChecked] = useState(done)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isEntry = type === 'in'
  const label = isEntry ? "État des lieux d'entrée effectué" : "État des lieux de sortie effectué"
  const warning = isEntry ? "Requis avant d'activer le bail" : "Requis avant de mettre fin au bail"

  const handleChange = async () => {
    if (checked || disabled) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/leases/${leaseId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        setChecked(true)
        router.refresh()
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const bgColor = isEntry ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
  const checkColor = isEntry ? 'text-amber-600 focus:ring-amber-500 border-amber-300' : 'text-blue-600 focus:ring-blue-500 border-blue-300'
  const warningColor = isEntry ? 'text-amber-700' : 'text-blue-700'

  return (
    <div className={`${bgColor} border rounded-xl p-4`}>
      <label className={`flex items-start gap-3 ${disabled && !checked ? 'opacity-50' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={loading || checked || disabled}
          className={`mt-1 w-5 h-5 rounded ${checkColor} disabled:opacity-50`}
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {isEntry ? '📋' : '📋'} {label}
          </p>
          {checked ? (
            <p className="text-sm text-emerald-600 mt-1">
              ✅ Confirmé {doneAt && `le ${formatDate(doneAt)}`}
            </p>
          ) : (
            <p className={`text-sm ${warningColor} mt-1`}>
              ⚠️ {warning}
            </p>
          )}
        </div>
      </label>
      
      {!checked && !disabled && (
        <p className="text-xs text-gray-500 mt-3 ml-8">
          Vous pourrez uploader le document PDF dans la section Documents.
        </p>
      )}
    </div>
  )
}