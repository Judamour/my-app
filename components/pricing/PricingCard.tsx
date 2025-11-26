'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type PlanConfig } from '@/lib/pricing'

interface PricingCardProps {
  plan: PlanConfig
  currentPlan: string
  propertyCount: number
  isActive: boolean
}

export default function PricingCard({
  plan,
  currentPlan,
  propertyCount,
  isActive,
}: PricingCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (plan.id === 'enterprise') {
      // Rediriger vers contact
      window.location.href = 'mailto:contact@votreapp.com'
      return
    }

    if (plan.id === 'free') {
      // Rediriger vers portail pour annuler l'abonnement actuel
      handleManageSubscription()
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          plan: plan.id,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert("Erreur lors de la création de l'abonnement")
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL returned')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert("Erreur lors de l'ouverture du portail")
      setLoading(false)
    }
  }

  const canUpgrade = plan.maxProperties > propertyCount
  const needsUpgrade = propertyCount > plan.maxProperties

  return (
    <div
      className={`
        relative rounded-2xl p-6 transition-all
        ${
          isActive
            ? 'bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-xl scale-105'
            : 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
        }
        ${plan.popular && !isActive ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Badge Popular */}
      {plan.popular && !isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-linear-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full">
          POPULAIRE
        </div>
      )}

      {/* Badge Actif */}
      {isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-blue-600 text-xs font-bold rounded-full">
          PLAN ACTUEL
        </div>
      )}

      {/* Nom du plan */}
      <h3
        className={`text-2xl font-bold mb-2 ${
          isActive ? 'text-white' : 'text-gray-900'
        }`}
      >
        {plan.name}
      </h3>

      {/* Description */}
      <p
        className={`text-sm mb-4 ${
          isActive ? 'text-blue-100' : 'text-gray-600'
        }`}
      >
        {plan.description}
      </p>

      {/* Prix */}
      <div className="mb-6">
        {plan.price === null ? (
          <div>
            <div
              className={`text-3xl font-bold ${
                isActive ? 'text-white' : 'text-gray-900'
              }`}
            >
              Sur devis
            </div>
          </div>
        ) : plan.price === 0 ? (
          <div>
            <div
              className={`text-4xl font-bold ${
                isActive ? 'text-white' : 'text-gray-900'
              }`}
            >
              Gratuit
            </div>
          </div>
        ) : (
          <div>
            <div
              className={`text-4xl font-bold ${
                isActive ? 'text-white' : 'text-gray-900'
              }`}
            >
              {plan.price}€
            </div>
            <div
              className={`text-sm ${
                isActive ? 'text-blue-100' : 'text-gray-600'
              }`}
            >
              par mois
            </div>
          </div>
        )}
      </div>

      {/* Limite propriétés */}
      <div
        className={`text-sm font-medium mb-6 ${
          isActive ? 'text-blue-100' : 'text-gray-700'
        }`}
      >
        {plan.maxProperties === 999
          ? '♾️ Propriétés illimitées'
          : `📊 Jusqu'à ${plan.maxProperties} propriétés`}
      </div>

      {/* Bouton CTA */}
      {isActive ? (
        <button
          onClick={handleManageSubscription}
          disabled={loading}
          className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Gérer mon abonnement'}
        </button>
      ) : needsUpgrade && currentPlan === 'free' ? (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Upgrader maintenant'}
        </button>
      ) : plan.id === 'enterprise' ? (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
            isActive
              ? 'bg-white text-blue-600 hover:bg-gray-100'
              : 'bg-linear-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
          }`}
        >
          Nous contacter
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={loading || !canUpgrade}
          className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
            isActive
              ? 'bg-white text-blue-600 hover:bg-gray-100'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {loading
            ? 'Chargement...'
            : !canUpgrade
            ? 'Non disponible'
            : 'Choisir ce plan'}
        </button>
      )}

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={isActive ? 'text-blue-200' : 'text-green-500'}>
              ✓
            </span>
            <span
              className={`text-sm ${
                isActive ? 'text-blue-100' : 'text-gray-600'
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
