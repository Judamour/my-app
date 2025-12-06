'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        // Récupérer les données utilisateur depuis Prisma pour connaître les rôles
        const res = await fetch('/api/auth/me')
        const userData = await res.json()

        if (userData.user) {
          const { isOwner, isTenant } = userData.user

          if (!isOwner && !isTenant) {
            router.push('/profile/complete')
          } else if (isOwner) {
            router.push('/owner')
          } else {
            router.push('/tenant')
          }
        } else {
          router.push('/profile/complete')
        }

        router.refresh()
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
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

          {/* Bouton Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-100 transition-colors flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

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

          {/* Lien inscription */}
          <p className="text-center text-gray-600 mt-8">
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
