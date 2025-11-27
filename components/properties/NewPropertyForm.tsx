'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import ImageUploader from '@/components/properties/ImageUploader'

interface NewPropertyFormProps {
  isNearLimit: boolean
  currentCount: number
  maxProperties: number
  planName: string
}

export default function NewPropertyForm({
  isNearLimit,
  currentCount,
  maxProperties,
  planName,
}: NewPropertyFormProps) {
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
        surface: Math.round(Number(surface)),
        rooms: Math.round(Number(rooms)),
        bedrooms: Math.round(Number(bedrooms)),
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Bandeau d'avertissement si proche de la limite */}
        {isNearLimit && planName !== 'Enterprise' && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Attention :</strong> Vous êtes à{' '}
                  <strong>
                    {currentCount}/{maxProperties}
                  </strong>{' '}
                  propriétés avec votre plan <strong>{planName}</strong>.{' '}
                  <Link
                    href="/pricing"
                    className="underline font-semibold hover:text-yellow-900"
                  >
                    Upgrader maintenant
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/owner/properties"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Retour aux propriétés
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Ajouter une propriété
          </h1>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erreur globale */}
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Titre */}
            <div>
              <label className="text-gray-900 block text-sm font-medium mb-2">
                Titre de l&apos;annonce *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Appartement T2 centre-ville"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12 rue de la République"
              />
            </div>

            {/* Ville & Code postal */}
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
                  className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75001"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bien *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="APARTMENT">Appartement</option>
                <option value="HOUSE">Maison</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>

            {/* Surface, Pièces, Chambres */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface (m²) *
                </label>
                <input
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  required
                  min="1"
                  className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pièces *
                </label>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  required
                  min="1"
                  className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chambres *
                </label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  required
                  min="0"
                  className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Loyer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyer mensuel (€) *
              </label>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
                min="1"
                step="0.01"
                className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="850.00"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-gray-900  w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre bien..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <ImageUploader images={images} onImagesChange={setImages} />
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Création en cours...' : 'Créer la propriété'}
              </button>
              <Link
                href="/owner/properties"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}