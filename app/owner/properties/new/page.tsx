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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
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
            <p className="text-gray-500">Formulaire en construction...</p>

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
