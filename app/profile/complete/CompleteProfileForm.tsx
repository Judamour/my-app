'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Session {
  user: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function CompleteProfileForm({
  session: initialSession,
  required,
}: {
  session: Session
  required?: string
}) {
  const router = useRouter()

  // Étape actuelle (1, 2, 3)
  const [step, setStep] = useState(1)

  // Données du formulaire
  const [isOwner, setIsOwner] = useState(false)
  const [isTenant, setIsTenant] = useState(false)
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // États de validation
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  // Pré-sélection si required
  useEffect(() => {
    if (required === 'owner') setIsOwner(true)
    if (required === 'tenant') setIsTenant(true)
  }, [required])

  // Validation téléphone en temps réel
  useEffect(() => {
    if (!phone) {
      setPhoneValid(null)
      return
    }
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
    setPhoneValid(phoneRegex.test(phone))
  }, [phone])

  // Gestion photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image trop lourde (max 5MB)')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Validation étape 1
  const canProceedStep1 = isOwner || isTenant

  // Soumission finale
  const handleSubmit = async () => {
    if (!isOwner && !isTenant) {
      toast.error('Veuillez sélectionner au moins un rôle')
      setStep(1)
      return
    }

    setLoading(true)

    try {
const hasOptionalInfo = !!(gender || birthDate || phone || address || photoPreview)

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: gender || null,
          birthDate: birthDate || null,
          phone: phone || null,
          address: address || null,
          isOwner,
          isTenant,
          profileComplete: hasOptionalInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la mise à jour')
        setLoading(false)
        return
      }

      toast.success('Profil complété avec succès !')

      setTimeout(() => {
        if (isOwner) {
          window.location.href = '/owner'
        } else if (isTenant) {
          window.location.href = '/tenant'
        } else {
          window.location.href = '/'
        }
      }, 500)
    } catch {
      toast.error('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Bienvenue {initialSession.user.firstName} ! 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Complétez votre profil en quelques étapes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step >= s
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-2 bg-gray-900 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Mon rôle</span>
            <span>Mes infos</span>
            <span>Ma photo</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* ÉTAPE 1 : Rôle */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <span className="text-4xl">🎯</span>
                <h2 className="text-xl font-semibold text-gray-900 mt-3">
                  Quel est votre profil ?
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Vous pouvez être les deux !
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setIsOwner(!isOwner)}
                  className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isOwner
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isOwner ? 'bg-gray-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">🏠</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">
                      Je suis propriétaire
                    </p>
                    <p className="text-sm text-gray-500">
                      Je mets en location mes biens
                    </p>
                  </div>
                  {isOwner && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsTenant(!isTenant)}
                  className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isTenant
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isTenant ? 'bg-gray-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">🔑</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">
                      Je suis locataire
                    </p>
                    <p className="text-sm text-gray-500">
                      Je cherche ou j&apos;ai un logement
                    </p>
                  </div>
                  {isTenant && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-6"
              >
                Continuer
              </button>
            </div>
          )}

          {/* ÉTAPE 2 : Informations */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <span className="text-4xl">📝</span>
                <h2 className="text-xl font-semibold text-gray-900 mt-3">
                  Vos informations
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Ces informations sont optionnelles
                </p>
              </div>

              <div className="space-y-4">
                {/* Civilité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Civilité
                  </label>
                  <div className="text-gray-700 mb-2 grid grid-cols-4 gap-2">
                    {[
                      { value: 'MALE', label: 'M.' },
                      { value: 'FEMALE', label: 'Mme' },
                      { value: 'OTHER', label: 'Autre' },
                      { value: 'PREFER_NOT_TO_SAY', label: '—' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setGender(gender === option.value ? '' : option.value)
                        }
                        className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          gender === option.value
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Date de naissance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    max={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18)
                      )
                        .toISOString()
                        .split('T')[0]
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-all text-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    🔒 Information privée, non visible par les autres
                    utilisateurs
                  </p>
                </div>
                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none text-gray-900 ${
                        phoneValid === null
                          ? 'border-gray-200 focus:border-gray-900'
                          : phoneValid
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                    />
                    {phoneValid !== null && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2">
                        {phoneValid ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                  {phoneValid === false && (
                    <p className="text-red-500 text-xs mt-1">Format invalide</p>
                  )}
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="12 rue de la Paix, 75000 Paris"
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-all resize-none text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Photo */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <span className="text-4xl">📷</span>
                <h2 className="text-xl font-semibold text-gray-900 mt-3">
                  Photo de profil
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Optionnel mais recommandé
                </p>
              </div>

              <div className="flex flex-col items-center">
                {/* Preview */}
                <div className="relative">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                      />
                      <button
                        onClick={() => setPhotoPreview(null)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-4xl text-gray-400">
                        {initialSession.user.firstName[0]}
                        {initialSession.user.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <label className="mt-6 cursor-pointer">
                  <span className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors inline-block">
                    {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG • Max 5MB</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? '⏳ Enregistrement...' : '✓ Terminer'}
                </button>
              </div>

              {/* Skip */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Passer cette étape →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Vos informations sont sécurisées et ne seront jamais partagées
        </p>
      </div>
    </div>
  )
}
