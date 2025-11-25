'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ProfileSettingsFormProps {
  initialSettings: {
    showBadges: boolean
    showLevel: boolean
    showRankBorder: boolean
    showReviewStats: boolean
    showPhone: boolean
    showAddress: boolean
  }
}

export default function PrivacySettingsForm({
  initialSettings,
}: ProfileSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const res = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('✅ Préférences enregistrées')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const toggles = [
    {
      key: 'showBadges' as const,
      icon: '🏆',
      label: 'Afficher mes badges',
      description: 'Montrez vos accomplissements',
    },
    {
      key: 'showLevel' as const,
      icon: '⭐',
      label: 'Afficher mon niveau',
      description: 'Affichez votre rang (Bronze, Or, etc.)',
    },
    {
      key: 'showRankBorder' as const,
      icon: '🎨',
      label: 'Bordure colorée avatar',
      description: 'Bordure selon votre rang',
    },
    {
      key: 'showReviewStats' as const,
      icon: '📊',
      label: 'Statistiques d\'avis',
      description: 'Note moyenne, taux caution, etc.',
    },
    {
      key: 'showPhone' as const,
      icon: '📱',
      label: 'Afficher mon téléphone',
      description: 'Visible par les propriétaires/locataires',
    },
    {
      key: 'showAddress' as const,
      icon: '📍',
      label: 'Afficher mon adresse',
      description: 'Votre adresse complète',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Liste des toggles */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        {toggles.map(toggle => (
          <div
            key={toggle.key}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{toggle.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{toggle.label}</p>
                <p className="text-xs text-gray-500">{toggle.description}</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => handleToggle(toggle.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[toggle.key] ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[toggle.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Note de confidentialité */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <span className="text-lg">🔒</span>
          <div>
            <p className="font-medium text-blue-900 text-sm">
              Confidentialité
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Seuls les propriétaires/locataires avec qui vous avez interagi
              peuvent voir votre profil public. Votre email et date de
              naissance restent toujours privés.
            </p>
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Enregistrement...' : '💾 Enregistrer les préférences'}
      </button>
    </div>
  )
}