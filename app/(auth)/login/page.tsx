'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

    console.log('🔐 Tentative de connexion avec:', email)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      console.log('📩 Résultat NextAuth:', result)

      if (result?.error) {
        console.log('❌ Erreur:', result.error)
        setError('Email ou mot de passe incorrect')
        return
      }

      console.log('✅ Connexion réussie ! Redirection...')
      router.push('/owner')
      router.refresh()
    } catch (err) {
      console.error('💥 Erreur catch:', err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Connexion NextAuth</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="jean@test.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Pas de compte ?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  )
}
