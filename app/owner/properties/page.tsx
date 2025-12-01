import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function PropertiesListPage() {
  const session = await requireOwner()
  
const properties = await prisma.property.findMany({
  where: {
    ownerId: session.user.id,
    deletedAt: null,  // 🆕 Exclure les supprimées
  },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      tenant: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  })

  const availableCount = properties.filter(p => p.available).length
  const rentedCount = properties.filter(p => !p.available).length

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mes propriétés
              </h1>
              <p className="text-gray-600 mt-1">
                {properties.length} bien{properties.length > 1 ? 's' : ''} enregistré{properties.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/owner/properties/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">➕</span>
              Ajouter un bien
            </Link>
          </div>
        </div>

        {properties.length === 0 ? (
          /* État vide */
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🏠</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Aucun bien enregistré
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Commencez par ajouter votre première propriété pour la partager avec des locataires potentiels.
            </p>
            <Link
              href="/owner/properties/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">➕</span>
              Ajouter mon premier bien
            </Link>
          </div>
        ) : (
          <>
            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                <p className="text-sm text-emerald-700 mb-1">Disponibles</p>
                <p className="text-2xl font-bold text-emerald-600">{availableCount}</p>
              </div>
              <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                <p className="text-sm text-orange-700 mb-1">Loués</p>
                <p className="text-2xl font-bold text-orange-600">{rentedCount}</p>
              </div>
            </div>

            {/* Grille de propriétés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/owner/properties/${property.id}`}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200"
                >
                  {/* Image */}
                  <div className="relative aspect-4/3 bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-5xl text-gray-300">🏠</span>
                      </div>
                    )}
                    
                    {/* Badge statut */}
                    <div className="absolute top-3 left-3">
                      {property.available ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm text-emerald-700 rounded-lg text-xs font-semibold">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm text-orange-700 rounded-lg text-xs font-semibold">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          Loué
                        </span>
                      )}
                    </div>

                    {/* Nombre de photos */}
                    {property.images && property.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-gray-900/80 text-white text-xs rounded-lg font-medium backdrop-blur-sm">
                        📷 {property.images.length}
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="p-5">
                    {/* Prix */}
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.rent)}
                        <span className="text-sm text-gray-500 font-normal">/mois</span>
                      </p>
                    </div>

                    {/* Titre */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {property.title}
                    </h3>

                    {/* Adresse */}
                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{property.city} ({property.postalCode})</span>
                    </p>

                    {/* Caractéristiques */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1">
                        <span>📐</span> {property.surface}m²
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🚪</span> {property.rooms}p
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🛏️</span> {property.bedrooms}ch
                      </span>
                    </div>

                    {/* Locataire */}
                    {property.tenant ? (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {property.tenant.firstName[0]}{property.tenant.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {property.tenant.firstName} {property.tenant.lastName}
                          </p>
                          <p className="text-xs text-gray-500">Locataire actuel</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <span>🔍</span>
                        <span>En recherche de locataire</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}