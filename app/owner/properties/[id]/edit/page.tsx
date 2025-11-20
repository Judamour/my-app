'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [type, setType] = useState('APARTMENT')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [rent, setRent] = useState('')
  const [description, setDescription] = useState('')
  const [available, setAvailable] = useState(true)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`)
        if (!response.ok) {
          setError('Impossible de charger la propriété')
          return
        }
        const data = await response.json()
        if (!data.available) {
          router.push(`/owner/properties/${id}`)
          return
        }
        setTitle(data.title)
        setAddress(data.address)
        setType(data.type)
        setSurface(String(data.surface))
        setRooms(String(data.rooms))
        setBedrooms(String(data.bedrooms))
        setRent(String(data.rent))
        setDescription(data.description || '')
        setAvailable(data.available)
      } catch {
        setError('Erreur de connexion')
      } finally {
        setLoadingData(false)
      }
    }
    fetchProperty()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const propertyData = {
        title,
        address,
        type,
        surface: Number(surface),
        rooms: Number(rooms),
        bedrooms: Number(bedrooms),
        rent: Number(rent),
        description: description || null,
        available,
      }
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la modification')
        return
      }
      router.push(`/owner/properties/${id}`)
      router.refresh()
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/owner/properties/${id}`}
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Retour aux détails
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Modifier la propriété
          </h1>
          <p className="text-sm text-gray-600">
            Mettez à jour les informations du bien
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="text-gray-900 placeholder:text-gray-500 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Studio centre-ville"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                className="text-gray-900 placeholder:text-gray-500 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12 rue de la Paix, 75001 Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bien <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                required
                className="text-gray-900 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="APARTMENT">Appartement</option>
                <option value="HOUSE">Maison</option>
                <option value="STUDIO">Studio</option>
                <option value="ROOM">Chambre</option>
                <option value="OFFICE">Bureau</option>
                <option value="PARKING">Parking</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="text-gray-900 placeholder:text-gray-500 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pièces <span className="text-red-500">*</span>
                </label>
                <select
                  value={rooms}
                  onChange={e => setRooms(e.target.value)}
                  required
                  className="text-gray-900 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chambres <span className="text-red-500">*</span>
                </label>
                <select
                  value={bedrooms}
                  onChange={e => setBedrooms(e.target.value)}
                  required
                  className="text-gray-900 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

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
                className="text-gray-900 placeholder:text-gray-500 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description{' '}
                <span className="text-gray-400 text-xs">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="text-gray-900 placeholder:text-gray-500 w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Bel appartement rénové..."
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="available"
                checked={available}
                onChange={e => setAvailable(e.target.checked)}
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="available"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Ce bien est disponible à la location
              </label>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t">
              <Link
                href={`/owner/properties/${id}`}
                className="w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-300 order-2 md:order-1"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 order-1 md:order-2"
              >
                {loading
                  ? 'Enregistrement...'
                  : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
