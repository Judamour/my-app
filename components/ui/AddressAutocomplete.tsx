'use client'

import { useState, useEffect, useRef } from 'react'

interface AddressResult {
  label: string
  housenumber?: string
  street?: string
  postcode: string
  city: string
  context: string
}

interface AddressAutocompleteProps {
  address: string
  city: string
  postalCode: string
  onAddressChange: (address: string) => void
  onCityChange: (city: string) => void
  onPostalCodeChange: (postalCode: string) => void
  required?: boolean
  disabled?: boolean
}

export default function AddressAutocomplete({
  address,
  city,
  postalCode,
  onAddressChange,
  onCityChange,
  onPostalCodeChange,
  required = false,
  disabled = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Recherche d'adresses avec debounce
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`
      )
      const data = await response.json()

      const results: AddressResult[] = data.features.map((feature: { properties: AddressResult }) => ({
        label: feature.properties.label,
        housenumber: feature.properties.housenumber,
        street: feature.properties.street,
        postcode: feature.properties.postcode,
        city: feature.properties.city,
        context: feature.properties.context,
      }))

      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Erreur API Adresse:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  // Gestion de la saisie avec debounce
  const handleInputChange = (value: string) => {
    onAddressChange(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(value)
    }, 300)
  }

  // Sélection d'une suggestion
  const handleSelectSuggestion = (suggestion: AddressResult) => {
    // Construire l'adresse (numéro + rue)
    const streetAddress = suggestion.housenumber
      ? `${suggestion.housenumber} ${suggestion.street || ''}`
      : suggestion.street || suggestion.label.split(',')[0]

    onAddressChange(streetAddress.trim())
    onCityChange(suggestion.city)
    onPostalCodeChange(suggestion.postcode)
    setShowSuggestions(false)
    setSuggestions([])
  }

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSelectSuggestion(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  // Gestion du code postal (5 chiffres max)
  const handlePostalCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 5)
    onPostalCodeChange(numericValue)
  }

  return (
    <div className="space-y-4">
      {/* Champ Adresse avec autocomplete */}
      <div ref={wrapperRef} className="relative">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Adresse {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={e => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            required={required}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Commencez à taper une adresse..."
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Liste des suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <p className="font-medium text-gray-900">{suggestion.label}</p>
                <p className="text-sm text-gray-500">{suggestion.context}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ville & Code postal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Ville {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={city}
            onChange={e => onCityChange(e.target.value)}
            required={required}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Paris"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Code postal {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={e => handlePostalCodeChange(e.target.value)}
            required={required}
            disabled={disabled}
            maxLength={5}
            pattern="[0-9]{5}"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="75001"
          />
          <p className="text-xs text-gray-500 mt-1">5 chiffres requis</p>
        </div>
      </div>
    </div>
  )
}
