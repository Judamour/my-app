'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ProfileDocuments from './ProfileDocuments'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  gender: string | null
  birthDate: Date | null
  phone: string | null
  address: string | null
  salary: number | null
  profession: string | null
  companyName: string | null
  contractType: string | null
  currentCity: string | null
  currentPostalCode: string | null
  isOwner: boolean
  isTenant: boolean
  showBadges: boolean
  showLevel: boolean
  showRankBorder: boolean
  showReviewStats: boolean
  showPhone: boolean
  showAddress: boolean
}

const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'INTERIM', label: 'Intérim' },
  { value: 'INDEPENDANT', label: 'Indépendant' },
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'RETRAITE', label: 'Retraité' },
  { value: 'AUTRE', label: 'Autre' },
]

const TABS = [
  { id: 'general', label: 'Informations générales', icon: '👤' },
  { id: 'professional', label: 'Infos professionnelles', icon: '💼' },
  { id: 'documents', label: 'Mes documents', icon: '📄' },
  { id: 'privacy', label: 'Confidentialité', icon: '🔒' },
]

export default function ProfileEditTabs({
  userData,
  activeTab = 'general',
}: {
  userData: UserData
  activeTab?: string
}) {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const [loading, setLoading] = useState(false)

  // États formulaire général
  const [gender, setGender] = useState(userData.gender || '')
  const [birthDate, setBirthDate] = useState(
    userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : ''
  )
  const [phone, setPhone] = useState(userData.phone || '')
  const [address, setAddress] = useState(userData.address || '')

  // États formulaire professionnel
  const [salary, setSalary] = useState(userData.salary?.toString() || '')
  const [profession, setProfession] = useState(userData.profession || '')
  const [companyName, setCompanyName] = useState(userData.companyName || '')
  const [contractType, setContractType] = useState(userData.contractType || '')
  const [currentCity, setCurrentCity] = useState(userData.currentCity || '')
  const [currentPostalCode, setCurrentPostalCode] = useState(userData.currentPostalCode || '')

  // États confidentialité
  const [showBadges, setShowBadges] = useState(userData.showBadges)
  const [showLevel, setShowLevel] = useState(userData.showLevel)
  const [showRankBorder, setShowRankBorder] = useState(userData.showRankBorder)
  const [showReviewStats, setShowReviewStats] = useState(userData.showReviewStats)
  const [showPhone, setShowPhone] = useState(userData.showPhone)
  const [showAddress, setShowAddress] = useState(userData.showAddress)

  const handleSaveGeneral = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: gender || null,
          birthDate: birthDate || null,
          phone: phone || null,
          address: address || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }

      toast.success('Informations mises à jour')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfessional = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salary: salary ? parseInt(salary) : null,
          profession: profession || null,
          companyName: companyName || null,
          contractType: contractType || null,
          currentCity: currentCity || null,
          currentPostalCode: currentPostalCode || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }

      toast.success('Informations professionnelles mises à jour')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showBadges,
          showLevel,
          showRankBorder,
          showReviewStats,
          showPhone,
          showAddress,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }

      toast.success('Préférences de confidentialité mises à jour')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Tabs navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                currentTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Onglet Général */}
        {currentTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informations générales
            </h2>

            {/* Civilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Civilité
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'MALE', label: 'M.' },
                  { value: 'FEMALE', label: 'Mme' },
                  { value: 'OTHER', label: 'Autre' },
                  { value: 'PREFER_NOT_TO_SAY', label: '—' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGender(gender === option.value ? '' : option.value)}
                    className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      gender === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
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
                onChange={(e) => setBirthDate(e.target.value)}
                max={
                  new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                    .toISOString()
                    .split('T')[0]
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 rue de la Paix, 75000 Paris"
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all resize-none text-gray-900"
              />
            </div>

            <button
              onClick={handleSaveGeneral}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}

        {/* Onglet Professionnel */}
        {currentTab === 'professional' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Informations professionnelles
              </h2>
              {!userData.isTenant && (
                <p className="text-sm text-gray-600 mb-4">
                  Ces informations sont particulièrement importantes si vous êtes locataire.
                </p>
              )}
            </div>

            {/* Salaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salaire mensuel net (€)
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="2500"
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900"
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profession / Métier
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Développeur web"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900"
              />
            </div>

            {/* Entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l&apos;entreprise
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="TechCorp"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900"
              />
            </div>

            {/* Type de contrat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de contrat
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900 bg-white"
              >
                <option value="">Sélectionnez</option>
                {CONTRACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Adresse actuelle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville actuelle
                </label>
                <input
                  type="text"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  placeholder="Paris"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={currentPostalCode}
                  onChange={(e) =>
                    setCurrentPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))
                  }
                  placeholder="75001"
                  maxLength={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-all text-gray-900"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfessional}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}

        {/* Onglet Documents */}
        {currentTab === 'documents' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mes documents
            </h2>
            <ProfileDocuments userId={userData.id} />
          </div>
        )}

        {/* Onglet Confidentialité */}
        {currentTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Préférences de confidentialité
            </h2>

            <div className="space-y-4">
              <PrivacyToggle
                label="Afficher mes badges"
                description="Les badges de gamification seront visibles sur mon profil"
                checked={showBadges}
                onChange={setShowBadges}
              />
              <PrivacyToggle
                label="Afficher mon niveau"
                description="Mon niveau et ma barre d'XP seront visibles"
                checked={showLevel}
                onChange={setShowLevel}
              />
              <PrivacyToggle
                label="Afficher ma bordure de rang"
                description="La bordure colorée autour de mon avatar sera visible"
                checked={showRankBorder}
                onChange={setShowRankBorder}
              />
              <PrivacyToggle
                label="Afficher mes statistiques d'avis"
                description="Ma note moyenne et le nombre d'avis seront visibles"
                checked={showReviewStats}
                onChange={setShowReviewStats}
              />
              <PrivacyToggle
                label="Afficher mon téléphone"
                description="Mon numéro de téléphone sera visible sur mon profil"
                checked={showPhone}
                onChange={setShowPhone}
              />
              <PrivacyToggle
                label="Afficher mon adresse"
                description="Mon adresse sera visible sur mon profil"
                checked={showAddress}
                onChange={setShowAddress}
              />
            </div>

            <button
              onClick={handleSavePrivacy}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PrivacyToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}