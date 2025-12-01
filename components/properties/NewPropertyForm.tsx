'use client'

import { useState, useEffect } from 'react'
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

const PROPERTY_TYPES = [
  {
    value: 'APARTMENT',
    label: '🏢 Appartement',
    icon: '🏢',
    hasRooms: true,
    hasBedrooms: true,
  },
  {
    value: 'HOUSE',
    label: '🏠 Maison',
    icon: '🏠',
    hasRooms: true,
    hasBedrooms: true,
  },
  {
    value: 'STUDIO',
    label: '🛏️ Studio',
    icon: '🛏️',
    hasRooms: false,
    hasBedrooms: false,
  },
  {
    value: 'PARKING',
    label: '🅿️ Parking',
    icon: '🅿️',
    hasRooms: false,
    hasBedrooms: false,
  },
  {
    value: 'OFFICE',
    label: '🏢 Bureau',
    icon: '🏢',
    hasRooms: true,
    hasBedrooms: false,
  },
  {
    value: 'SHOP',
    label: '🏪 Commerce',
    icon: '🏪',
    hasRooms: true,
    hasBedrooms: false,
  },
  {
    value: 'LAND',
    label: '🌳 Terrain',
    icon: '🌳',
    hasRooms: false,
    hasBedrooms: false,
  },
  {
    value: 'WAREHOUSE',
    label: '🏭 Entrepôt',
    icon: '🏭',
    hasRooms: false,
    hasBedrooms: false,
  },
  {
    value: 'GARAGE',
    label: '🚗 Garage',
    icon: '🚗',
    hasRooms: false,
    hasBedrooms: false,
  },
  {
    value: 'ROOM',
    label: '🚪 Chambre',
    icon: '🚪',
    hasRooms: false,
    hasBedrooms: false,
  },
]

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

  // Obtenir la config du type sélectionné
  const selectedTypeConfig = PROPERTY_TYPES.find(t => t.value === type)

  // Réinitialiser pièces/chambres quand type change
  useEffect(() => {
    if (!selectedTypeConfig?.hasRooms) {
      setRooms('0')
    } else if (rooms === '0') {
      setRooms('2')
    }

    if (!selectedTypeConfig?.hasBedrooms) {
      setBedrooms('0')
    } else if (bedrooms === '0' && selectedTypeConfig.hasBedrooms) {
      setBedrooms('1')
    }
  }, [type, selectedTypeConfig, rooms, bedrooms])

  // Désactiver scroll sur inputs number
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' &&
        (target as HTMLInputElement).type === 'number'
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })
    return () => document.removeEventListener('wheel', handleWheel)
  }, [])

  const handlePostalCodeChange = (value: string) => {
    // Limiter à 5 chiffres seulement
    const numericValue = value.replace(/\D/g, '').slice(0, 5)
    setPostalCode(numericValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation code postal
    if (postalCode.length !== 5) {
      setError('Le code postal doit contenir exactement 5 chiffres')
      toast.error('Le code postal doit contenir exactement 5 chiffres')
      return
    }

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
        rooms: selectedTypeConfig?.hasRooms ? Math.round(Number(rooms)) : 0,
        bedrooms: selectedTypeConfig?.hasBedrooms
          ? Math.round(Number(bedrooms))
          : 0,
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bandeau avertissement */}
        {isNearLimit && planName !== 'Enterprise' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-600"
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
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
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
        <div className="mb-6">
          <Link
            href="/owner/properties"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour aux propriétés
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Ajouter une propriété
          </h1>
          <p className="text-gray-600 mt-1">
            Remplissez les informations de votre bien immobilier
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erreur globale */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Section 1 : Informations générales */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                📋 Informations générales
              </h2>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Titre de l&apos;annonce{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="Ex: Appartement T2 centre-ville avec balcon"
                />
              </div>

              {/* Type de bien */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Type de bien <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {PROPERTY_TYPES.map(propertyType => (
                    <button
                      key={propertyType.value}
                      type="button"
                      onClick={() => setType(propertyType.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        type === propertyType.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{propertyType.icon}</div>
                      <div className="text-xs">
                        {propertyType.label.split(' ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2 : Localisation */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                📍 Localisation
              </h2>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="12 rue de la République"
                />
              </div>

              {/* Ville & Code postal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => handlePostalCodeChange(e.target.value)}
                    required
                    maxLength={5}
                    pattern="[0-9]{5}"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                    placeholder="75001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    5 chiffres requis
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 : Caractéristiques */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                📐 Caractéristiques
              </h2>

              {/* Surface - input classique */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Surface (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={surface}
                  onChange={e => setSurface(e.target.value)}
                  onWheel={e => e.currentTarget.blur()}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                  placeholder="45"
                />
              </div>

              {/* Pièces et Chambres - Boutons +/- style Airbnb */}
              {(selectedTypeConfig?.hasRooms ||
                selectedTypeConfig?.hasBedrooms) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Pièces */}
                  {selectedTypeConfig?.hasRooms && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Pièces</p>
                        <p className="text-sm text-gray-500">
                          Nombre total de pièces
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setRooms(String(Math.max(1, Number(rooms) - 1)))
                          }
                          disabled={Number(rooms) <= 1}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-lg font-semibold text-gray-900">
                          {rooms}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRooms(String(Number(rooms) + 1))}
                          disabled={Number(rooms) >= 20}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Chambres */}
                  {selectedTypeConfig?.hasBedrooms && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Chambres</p>
                        <p className="text-sm text-gray-500">
                          Pièces pour dormir
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setBedrooms(
                              String(Math.max(0, Number(bedrooms) - 1))
                            )
                          }
                          disabled={Number(bedrooms) <= 0}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-lg font-semibold text-gray-900">
                          {bedrooms}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setBedrooms(String(Number(bedrooms) + 1))
                          }
                          disabled={Number(bedrooms) >= Number(rooms)}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message info si pas de pièces/chambres */}
              {!selectedTypeConfig?.hasRooms &&
                !selectedTypeConfig?.hasBedrooms && (
                  <p className="text-sm text-gray-500 italic">
                    Ce type de bien ne nécessite pas de préciser le nombre de
                    pièces ou chambres
                  </p>
                )}
            </div>

            {/* Section 4 : Loyer */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                💰 Loyer
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Loyer mensuel (€) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rent}
                    onChange={e => setRent(e.target.value)}
                    onWheel={e => e.currentTarget.blur()}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 pr-24 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="850.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                    € / mois
                  </span>
                </div>
              </div>
            </div>

            {/* Section 5 : Description */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                📝 Description
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description du bien
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Décrivez les points forts de votre bien : équipements, état, proximités, transports..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optionnel mais recommandé
                </p>
              </div>
            </div>

            {/* Section 6 : Photos */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                📷 Photos
              </h2>

              <ImageUploader images={images} onImagesChange={setImages} />
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Création en cours...
                  </>
                ) : (
                  <>✓ Créer la propriété</>
                )}
              </button>
              <Link
                href="/owner/properties"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
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
