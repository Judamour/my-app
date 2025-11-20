'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import ImageUploader from '@/components/properties/ImageUploader'

export default function NewPropertyPage() {
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [type, setType] = useState('APARTMENT')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('2')
  const [bedrooms, setBedrooms] = useState('1')
  const [rent, setRent] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let success = false

    try {
      const propertyData = {
        title,
        address,
        city,
        postalCode,
        type,
        surface: Number(surface),
        rooms: Number(rooms),
        bedrooms: Number(bedrooms),
        rent: Number(rent),
        description: description || null,
        images,
      }

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || 'Erreur lors de la création'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      success = true
      toast.success('Propriété créée avec succès !')
      router.push('/owner/properties')
      router.refresh()
    } catch {
      if (!success) {
        const errorMsg = 'Erreur de connexion au serveur'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/owner/properties"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mes propriétés
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Titre */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Ajouter un bien
          </h1>
          <p className="text-gray-500">
            Remplissez les informations de votre propriété
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1 : Infos principales */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Informations principales
            </h2>
            
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l&apos;annonce *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Ex: Bel appartement lumineux avec balcon"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de bien *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { value: 'APARTMENT', label: 'Appart.', icon: '🏢' },
                    { value: 'HOUSE', label: 'Maison', icon: '🏠' },
                    { value: 'STUDIO', label: 'Studio', icon: '🛋️' },
                    { value: 'ROOM', label: 'Chambre', icon: '🛏️' },
                    { value: 'PARKING', label: 'Parking', icon: '🚗' },
                    { value: 'OFFICE', label: 'Bureau', icon: '💼' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setType(item.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        type === item.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{item.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Loyer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyer mensuel *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="1200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€/mois</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 : Localisation */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Localisation
            </h2>
            
            <div className="space-y-6">
              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse (n° et rue) *
                  <span className="text-gray-400 font-normal ml-2">🔒 Visible uniquement par les candidats acceptés</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="12 rue de la Paix"
                />
              </div>

              {/* Ville + CP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="75001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 : Caractéristiques */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Caractéristiques
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Surface */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    required
                    min="1"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="45"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
                </div>
              </div>

              {/* Pièces */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pièces *
                </label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>{n} {n > 1 ? 'pièces' : 'pièce'}</option>
                  ))}
                </select>
              </div>

              {/* Chambres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chambres *
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none bg-white"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n === 0 ? 'Studio' : `${n} ch.`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4 : Photos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Photos
            </h2>
            
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </div>

          {/* Section 5 : Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">5</span>
              Description
              <span className="text-gray-400 font-normal text-sm">(optionnel)</span>
            </h2>
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Décrivez votre bien : caractéristiques, équipements, environnement..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-4 pt-6 border-t border-gray-100">
            <Link
              href="/owner/properties"
              className="px-8 py-4 text-center text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Création...
                </span>
              ) : (
                'Publier le bien'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}