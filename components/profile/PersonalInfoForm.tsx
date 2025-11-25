'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PersonalInfoFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    gender: string | null
    birthDate: Date | null
    phone: string | null
    address: string | null
  }
}

export default function PersonalInfoForm({
  initialData,
}: PersonalInfoFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    gender: initialData.gender || '',
    birthDate: initialData.birthDate
      ? new Date(initialData.birthDate).toISOString().split('T')[0]
      : '',
    phone: initialData.phone || '',
    address: initialData.address || '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Le prénom et le nom sont requis')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('✅ Profil mis à jour')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email (lecture seule) */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <span className="text-lg">📧</span>
          <div>
            <p className="font-medium text-blue-900 text-sm">Email</p>
            <p className="text-sm text-blue-700 mt-1">{initialData.email}</p>
            <p className="text-xs text-blue-600 mt-1">
              L&apos;email ne peut pas être modifié
            </p>
          </div>
        </div>
      </div>

      {/* Prénom et Nom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-900"
            placeholder="Jean"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-900"
            placeholder="Dupont"
          />
        </div>
      </div>

      {/* Genre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Genre
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-900"
        >
          <option value="">Non précisé</option>
          <option value="MALE">Monsieur</option>
          <option value="FEMALE">Madame</option>
          <option value="OTHER">Autre</option>
          <option value="PREFER_NOT_TO_SAY">Préfère ne pas dire</option>
        </select>
      </div>

      {/* Date de naissance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date de naissance
        </label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-900"
        />
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-900"
          placeholder="06 12 34 56 78"
        />
      </div>

      {/* Adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-900"
          placeholder="12 rue de la Paix, 75001 Paris"
        />
      </div>

      {/* Bouton de sauvegarde */}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
      </button>
    </form>
  )
}