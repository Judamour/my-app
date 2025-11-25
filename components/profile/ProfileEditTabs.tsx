'use client'

import { useState } from 'react'
import PersonalInfoForm from './PersonalInfoForm' 
import PrivacySettingsForm from './PrivacySettingsForm'

type Tab = 'info' | 'privacy'

interface ProfileEditTabsProps {
  userData: {
    firstName: string
    lastName: string
    email: string
    gender: string | null
    birthDate: Date | null
    phone: string | null
    address: string | null
    showBadges: boolean
    showLevel: boolean
    showRankBorder: boolean
    showReviewStats: boolean
    showPhone: boolean
    showAddress: boolean
  }
}

export default function ProfileEditTabs({ userData }: ProfileEditTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info')

  const tabs = [
    {
      id: 'info' as Tab,
      label: '📋 Informations personnelles',
      description: 'Prénom, téléphone, adresse...',
    },
    {
      id: 'privacy' as Tab,
      label: '👁️ Confidentialité',
      description: 'Contrôlez ce qui est visible',
    },
  ]

  return (
    <div>
      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-6 text-left transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div
              className={`font-medium ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {tab.label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'info' && (
          <PersonalInfoForm
            initialData={{
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              gender: userData.gender,
              birthDate: userData.birthDate,
              phone: userData.phone,
              address: userData.address,
            }}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacySettingsForm
            initialSettings={{
              showBadges: userData.showBadges,
              showLevel: userData.showLevel,
              showRankBorder: userData.showRankBorder,
              showReviewStats: userData.showReviewStats,
              showPhone: userData.showPhone,
              showAddress: userData.showAddress,
            }}
          />
        )}
      </div>
    </div>
  )
}