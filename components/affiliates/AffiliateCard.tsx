'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Partner {
  id: string
  name: string
  slug: string
  logo: string | null
  category: string
  headline: string
  description: string | null
  features: string[]
  url: string
  ctaText: string
  isFeatured: boolean
}

interface AffiliateCardProps {
  partner: Partner
  source: string
  leaseId?: string
}

export default function AffiliateCard({
  partner,
  source,
  leaseId,
}: AffiliateCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)

    try {
      // Enregistrer le clic
      const response = await fetch('/api/affiliates/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: partner.id,
          source,
          leaseId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.redirectUrl) {
        // Ouvrir le lien affilié dans un nouvel onglet
        window.open(data.redirectUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('Error tracking click:', error)
      // En cas d'erreur, ouvrir quand même le lien
      window.open(partner.url, '_blank', 'noopener,noreferrer')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'INSURANCE':
        return 'bg-red-500'
      case 'ENERGY':
        return 'bg-yellow-500'
      case 'INTERNET':
        return 'bg-blue-500'
      case 'MOVING':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
        partner.isFeatured
          ? 'border-purple-300 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Badge Featured */}
      {partner.isFeatured && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-t-lg text-center">
          ⭐ RECOMMANDÉ
        </div>
      )}

      <div className="p-5">
        {/* Header avec logo */}
        <div className="flex items-start gap-4 mb-4">
          {partner.logo ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <Image
                src={partner.logo}
                alt={partner.name}
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0 ${getCategoryColor(partner.category)}`}
            >
              {partner.category === 'INSURANCE' && '🛡️'}
              {partner.category === 'ENERGY' && '⚡'}
              {partner.category === 'INTERNET' && '🌐'}
              {partner.category === 'MOVING' && '📦'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg">{partner.name}</h3>
            <p className="text-gray-600 text-sm">{partner.headline}</p>
          </div>
        </div>

        {/* Features */}
        {partner.features.length > 0 && (
          <div className="space-y-2 mb-4">
            {partner.features.slice(0, 3).map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <svg
                  className="w-4 h-4 text-green-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description courte */}
        {partner.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {partner.description}
          </p>
        )}

        {/* CTA Button */}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
            partner.isFeatured
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : 'bg-gray-900 hover:bg-gray-800'
          } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Chargement...
            </>
          ) : (
            <>
              {partner.ctaText}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
