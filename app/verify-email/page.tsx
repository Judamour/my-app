'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  // Initialiser le status en fonction de la présence du token
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() =>
    token ? 'loading' : 'error'
  )
  const [message, setMessage] = useState(() =>
    token ? '' : 'Token de vérification manquant'
  )
// commentaire test
  useEffect(() => {
    if (!token) return

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Votre email a été vérifié avec succès !')

          // Redirection automatique après 3 secondes
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Erreur de vérification')
        }
      } catch {
        setStatus('error')
        setMessage('Erreur de connexion au serveur')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification en cours...
            </h1>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email vérifié !
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirection automatique vers la page de connexion...
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Se connecter maintenant
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur de vérification
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Retour à la connexion
              </Link>
              <Link
                href="/register"
                className="block px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Créer un nouveau compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant principal avec Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Chargement...
              </h1>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}