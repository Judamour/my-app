'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPropertyPage() {
  // --- ÉTATS (un par champ du formulaire) ---
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [type, setType] = useState('APARTMENT')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [rent, setRent] = useState('')
  const [description, setDescription] = useState('')

  // États pour gérer l'UI
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  // --- FONCTION DE SOUMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Envoyer à l'API
      console.log('Envoi des données...')
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // --- JSX (Interface) ---
  return (
    <div className=" min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Nouvelle Propriété
          </h1>
          <p className="text-sm text-gray-600">
            Ajoutez un nouveau bien à votre portefeuille
          </p>
        </div>

        {/* Card du formulaire */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TODO: Ajouter les champs */}
            {/* 1. Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="
    text-gray-900 
    placeholder:text-gray-500 
      w-full 
      p-3 
      text-base 
      border border-gray-300 
      rounded-lg
      focus:ring-2 
      focus:ring-blue-500 
      focus:border-transparent
    "
                placeholder="Ex: Studio centre-ville"
              />
            </div>
            {/* 2. Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                className="
    text-gray-900 
    placeholder:text-gray-500 
      w-full p-3 text-base 
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
     "
                placeholder="12 rue de la Paix, 75001 Paris"
              />
            </div>
            {/* 4-5-6. Surface, Pièces, Chambres (Grid responsive) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Surface */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={surface}
                  onChange={e => setSurface(e.target.value)}
                  required
                  min="1"
                  className="
      text-gray-900 
      placeholder:text-gray-500 
        w-full p-3 text-base 
        border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
   
      "
                  placeholder="45"
                />
              </div>
            </div>
            {/* Pièces */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pièces <span className="text-red-500">*</span>
              </label>
              <select
                value={rooms}
                onChange={e => setRooms(e.target.value)}
                required
                className="
      text-gray-900 
      placeholder:text-gray-500 
      w-full p-3 text-base 
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
    "
              >
                <option value="">Choisir</option>
                <option value="1">1 pièce</option>
                <option value="2">2 pièces</option>
                <option value="3">3 pièces</option>
                <option value="4">4 pièces</option>
                <option value="5">5 pièces</option>
                <option value="6">6 pièces</option>
                <option value="7">7 pièces et +</option>
              </select>
            </div>

            {/* Chambres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chambres <span className="text-red-500">*</span>
              </label>
              <select
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                required
                className="
      text-gray-900 
      placeholder:text-gray-500 
      w-full p-3 text-base 
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
    "
              >
                <option value="">Choisir</option>
                <option value="0">Studio (0 chambre)</option>
                <option value="1">1 chambre</option>
                <option value="2">2 chambres</option>
                <option value="3">3 chambres</option>
                <option value="4">4 chambres</option>
                <option value="5">5 chambres</option>
                <option value="6">6 chambres et +</option>
              </select>
            </div>
            {/* 7. Loyer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyer mensuel (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={rent}
                onChange={e => setRent(e.target.value)}
                required
                min="0"
                step="0.01"
                className="
    text-gray-900 
    placeholder:text-gray-500 
      w-full p-3 text-base 
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
    "
                placeholder="1200"
              />
            </div>
            {/* 8. Description (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description{' '}
                <span className="text-gray-400 text-xs">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="
    text-gray-900 
    placeholder:text-gray-500 
      w-full p-3 text-base 
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
      resize-none
    "
                placeholder="Bel appartement rénové, proche des transports..."
              />
            </div>
            {/* Boutons */}
            <div className="flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t">
              <Link
                href="/owner/properties"
                className="
                  w-full md:w-auto 
                  px-6 py-3 
                  bg-gray-200 text-gray-700 
                  text-center
                  rounded-lg font-medium
                  hover:bg-gray-300
                  order-2 md:order-1
                "
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full md:flex-1 
                  px-6 py-3 
                  bg-blue-500 text-white 
                  rounded-lg font-medium
                  hover:bg-blue-600
                  disabled:bg-gray-400
                  order-1 md:order-2
                "
              >
                {loading ? 'Création...' : 'Créer la propriété'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
