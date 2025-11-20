'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation password match
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    // Validation longueur password
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
        return
      }

      // Succès ! Rediriger vers login
      toast.success(
        'Inscription réussie ! Vous pouvez maintenant vous connecter.'
      )
      router.push('/login')
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-blue-500 min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
        <p className="text-sm text-gray-600 mb-6">
          Rejoignez-nous en quelques secondes
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Prénom */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Jean"
            />
          </div>

          {/* Nom */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Dupont"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="jean.dupont@example.com"
            />
          </div>

          {/* Mot de passe */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-2 border rounded"
              placeholder="Min. 8 caractères"
            />
          </div>

          {/* Confirmer mot de passe */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Répétez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          Déjà inscrit ?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
