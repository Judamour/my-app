'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Session {
  user: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function CompleteProfileForm({ 
  session, 
  required 
}: { 
  session: Session
  required?: string 
}) {
  const router = useRouter()

  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [isTenant, setIsTenant] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isOwner && !isTenant) {
      setError('Veuillez cocher au moins une case (propriétaire ou locataire)')
      return
    }

    if (required === 'owner' && !isOwner) {
      setError('Vous devez cocher "Je suis propriétaire" pour accéder à cette page')
      return
    }

    if (required === 'tenant' && !isTenant) {
      setError('Vous devez cocher "Je suis locataire" pour accéder à cette page')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: gender || null,
          phone: phone || null,
          address: address || null,
          isOwner,
          isTenant,
          profileComplete: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la mise à jour')
        return
      }

      if (isOwner) {
        router.push('/owner/properties')
      } else if (isTenant) {
        router.push('/tenant/dashboard')
      } else {
        router.push('/')
      }
      
      router.refresh()
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-[500px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenue {session.user.firstName} ! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Complétez votre profil pour continuer
          </p>
        </div>

        {required && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded mb-4 text-sm">
            {required === 'owner' && '🏠 Vous devez être propriétaire pour accéder à cette page'}
            {required === 'tenant' && '🔑 Vous devez être locataire pour accéder à cette page'}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Civilité <span className="text-gray-400 text-xs">(optionnel)</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Choisir --</option>
              <option value="MALE">Monsieur</option>
              <option value="FEMALE">Madame</option>
              <option value="OTHER">Autre</option>
              <option value="PREFER_NOT_TO_SAY">Ne pas préciser</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Téléphone <span className="text-gray-400 text-xs">(optionnel)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Adresse <span className="text-gray-400 text-xs">(optionnel)</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
              placeholder="12 rue de la Paix, 75001 Paris"
            />
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded">
            <label className="block text-sm font-semibold mb-3">
              Je suis : <span className="text-red-500">*</span>
            </label>
            
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOwner}
                  onChange={(e) => setIsOwner(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm">
                  🏠 <strong>Propriétaire</strong> - Je possède des biens à louer
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTenant}
                  onChange={(e) => setIsTenant(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm">
                  🔑 <strong>Locataire</strong> - Je loue un bien
                </span>
              </label>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Vous pouvez cocher les deux si vous êtes à la fois propriétaire et locataire
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Enregistrement...' : 'Valider mon profil'}
          </button>
        </form>
      </div>
    </div>
  )
}
