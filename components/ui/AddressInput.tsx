'use client'

import { useState, useEffect, useRef } from 'react'

interface AddressResult {
  label: string
  postcode: string
  city: string
  context: string
}

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  onCityChange?: (city: string) => void
  onPostalCodeChange?: (postalCode: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// Composant simplifié pour un seul champ d'adresse avec autocomplete
export default function AddressInput({
  value,
  onChange,
  onCityChange,
  onPostalCodeChange,
  placeholder = 'Commencez à taper une adresse...',
  label,
  required = false,
  disabled = false,
  className = '',
}: AddressInputProps) {
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
  const handleInputChange = (newValue: string) => {
    onChange(newValue)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(newValue)
    }, 300)
  }

  // Sélection d'une suggestion
  const handleSelectSuggestion = (suggestion: AddressResult) => {
    onChange(suggestion.label)
    onCityChange?.(suggestion.city)
    onPostalCodeChange?.(suggestion.postcode)
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

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          required={required}
          disabled={disabled}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Liste des suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? 'bg-gray-100 text-gray-900'
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
  )
}
