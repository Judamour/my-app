'use client'

import { useState, useEffect } from 'react'

interface Contact {
  name: string
  phone: string
  role: string
  notes?: string
}

interface UsefulContactsProps {
  leaseId: string
  isOwner: boolean
  initialContacts?: Contact[]
}

const ROLE_OPTIONS = [
  { value: 'Plombier', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
  { value: 'Électricien', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Syndic', icon: '🏢', color: 'bg-purple-100 text-purple-700' },
  { value: 'Gardien', icon: '👤', color: 'bg-gray-100 text-gray-700' },
  { value: 'Urgences', icon: '🚨', color: 'bg-red-100 text-red-700' },
  { value: 'Chauffagiste', icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  { value: 'Serrurier', icon: '🔑', color: 'bg-amber-100 text-amber-700' },
  { value: 'Propriétaire', icon: '🏠', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'Agence', icon: '🏪', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'Assurance', icon: '🛡️', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'Autre', icon: '📞', color: 'bg-gray-100 text-gray-700' },
]

export default function UsefulContacts({
  leaseId,
  isOwner,
  initialContacts = [],
}: UsefulContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedContacts, setEditedContacts] = useState<Contact[]>(initialContacts)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState<Contact>({
    name: '',
    phone: '',
    role: '',
    notes: '',
  })

  useEffect(() => {
    setContacts(initialContacts)
    setEditedContacts(initialContacts)
  }, [initialContacts])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/leases/${leaseId}/contacts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: editedContacts }),
      })

      if (response.ok) {
        setContacts(editedContacts)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedContacts(contacts)
    setIsEditing(false)
    setShowAddForm(false)
    setNewContact({ name: '', phone: '', role: '', notes: '' })
  }

  const handleAddContact = () => {
    if (newContact.name && newContact.phone && newContact.role) {
      setEditedContacts([...editedContacts, { ...newContact }])
      setNewContact({ name: '', phone: '', role: '', notes: '' })
      setShowAddForm(false)
    }
  }

  const handleRemoveContact = (index: number) => {
    setEditedContacts(editedContacts.filter((_, i) => i !== index))
  }

  const handleUpdateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...editedContacts]
    updated[index] = { ...updated[index], [field]: value }
    setEditedContacts(updated)
  }

  const getRoleConfig = (role: string) => {
    return ROLE_OPTIONS.find(r => r.value.toLowerCase() === role.toLowerCase()) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1]
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">📇</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Contacts utiles</h2>
            <p className="text-sm text-gray-500">
              {contacts.length === 0
                ? 'Numéros importants pour le logement'
                : `${contacts.length} contact${contacts.length > 1 ? 's' : ''} enregistré${contacts.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Modifier
          </button>
        )}
        {isOwner && isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!isEditing ? (
          // Mode lecture
          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📞</span>
                </div>
                <p className="text-gray-500 mb-1">
                  {isOwner
                    ? 'Aucun contact ajouté'
                    : 'Aucun contact renseigné'}
                </p>
                <p className="text-sm text-gray-400">
                  {isOwner
                    ? 'Ajoutez les numéros utiles pour vos locataires'
                    : 'Le propriétaire n\'a pas encore ajouté de contacts'}
                </p>
              </div>
            ) : (
              contacts.map((contact, index) => {
                const roleConfig = getRoleConfig(contact.role)
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className={`w-12 h-12 ${roleConfig.color} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                      {roleConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{contact.name}</p>
                        <span className={`text-xs px-2 py-0.5 ${roleConfig.color} rounded-full font-medium`}>
                          {contact.role}
                        </span>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-base text-gray-700 font-medium hover:text-emerald-600 transition-colors"
                      >
                        {contact.phone}
                      </a>
                      {contact.notes && (
                        <p className="text-sm text-gray-500 mt-1">{contact.notes}</p>
                      )}
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="hidden sm:inline">Appeler</span>
                    </a>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          // Mode édition
          <div className="space-y-4">
            {editedContacts.map((contact, index) => {
              const roleConfig = getRoleConfig(contact.role)
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${roleConfig.color} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                      {roleConfig.icon}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(index, 'name', e.target.value)}
                            placeholder="Ex: Jean Dupont"
                            className="text-gray-800 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => handleUpdateContact(index, 'phone', e.target.value)}
                            placeholder="06 12 34 56 78"
                            className="text-gray-800 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type de contact</label>
                        <div className="flex flex-wrap gap-2">
                          {ROLE_OPTIONS.map((role) => (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => handleUpdateContact(index, 'role', role.value)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                contact.role === role.value
                                  ? `${role.color} ring-2 ring-offset-1 ring-gray-400`
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <span>{role.icon}</span>
                              <span>{role.value}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optionnel)</label>
                        <input
                          type="text"
                          value={contact.notes || ''}
                          onChange={(e) => handleUpdateContact(index, 'notes', e.target.value)}
                          placeholder="Ex: Disponible 24h/24"
                          className="text-gray-800 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveContact(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Formulaire d'ajout */}
            {showAddForm ? (
              <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 border-dashed">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">➕</span>
                  </div>
                  <p className="font-medium text-emerald-800">Nouveau contact</p>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nom *</label>
                      <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Ex: Jean Dupont"
                        className="text-gray-800 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="06 12 34 56 78"
                        className="text-gray-800 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type de contact *</label>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setNewContact({ ...newContact, role: role.value })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            newContact.role === role.value
                              ? `${role.color} ring-2 ring-offset-1 ring-gray-400`
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <span>{role.icon}</span>
                          <span>{role.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optionnel)</label>
                    <input
                      type="text"
                      value={newContact.notes || ''}
                      onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                      placeholder="Ex: Disponible 24h/24"
                      className="text-gray-800 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setNewContact({ name: '', phone: '', role: '', notes: '' })
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddContact}
                      disabled={!newContact.name || !newContact.phone || !newContact.role}
                      className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Ajouter le contact
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un contact
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
