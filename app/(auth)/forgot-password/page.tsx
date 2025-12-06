'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✉️</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Email envoyé !
          </h1>
          <p className="text-gray-600 mb-8">
            Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Pensez à vérifier vos spams si vous ne trouvez pas l'email.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Titre */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-500 mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Envoi...
              </span>
            ) : (
              'Envoyer le lien'
            )}
          </button>
        </form>

        {/* Lien retour */}
        <p className="text-center text-gray-600 mt-8">
          <Link
            href="/login"
            className="font-medium text-gray-900 hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
