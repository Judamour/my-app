'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
        return
      }

      router.push('/owner')
      router.refresh()
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Partie gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo / Titre */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏠</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Bon retour !
            </h1>
            <p className="text-gray-500 mt-2">
              Connectez-vous à votre compte
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="vous@exemple.com"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Lien inscription */}
          <p className="text-center text-gray-600">
            Pas encore de compte ?{' '}
            <Link
              href="/register"
              className="font-medium text-gray-900 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Partie droite - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-rose-50 to-orange-50 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="text-8xl mb-8">🔑</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Gérez vos locations en toute confiance
          </h2>
          <p className="text-gray-600">
            Passport de confiance, gestion de baux, quittances automatiques, et bien plus.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            <div>
              <p className="text-3xl font-semibold text-gray-900">15k+</p>
              <p className="text-sm text-gray-500">Utilisateurs</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-gray-900">8k+</p>
              <p className="text-sm text-gray-500">Biens gérés</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-gray-900">4.9</p>
              <p className="text-sm text-gray-500">Note moyenne</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}