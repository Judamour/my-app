import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function PropertiesListPage() {
  const session = await requireOwner()
  
  const properties = await prisma.property.findMany({
    where: {
      ownerId: session.user.id
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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link
                href="/owner"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <h1 className="text-3xl font-semibold text-gray-900">
                Mes propriétés
              </h1>
              <p className="text-gray-500 mt-1">
                {properties.length} bien{properties.length > 1 ? 's' : ''} enregistré{properties.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/owner/properties/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">➕</span>
              Ajouter un bien
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {properties.length === 0 ? (
          /* État vide */
          <div className="text-center py-20">
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
          /* Grille de propriétés */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/owner/properties/${property.id}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-5xl text-gray-300">🏠</span>
                    </div>
                  )}
                  
                  {/* Badge statut */}
                  <div className="absolute top-3 left-3">
                    {property.available ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm text-orange-700 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Loué
                      </span>
                    )}
                  </div>

                  {/* Nombre de photos */}
                  {property.images && property.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
                      📷 {property.images.length}
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="p-5">
                  {/* Prix */}
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-xl font-semibold text-gray-900">
                      {formatPrice(property.rent)}
                      <span className="text-sm text-gray-400 font-normal">/mois</span>
                    </p>
                  </div>

                  {/* Titre */}
                  <h3 className="font-medium text-gray-900 mb-1 truncate group-hover:text-gray-700">
                    {property.title}
                  </h3>

                  {/* Adresse */}
                  <p className="text-sm text-gray-500 truncate mb-4">
                    📍  {property.city} ({property.postalCode})
                  </p>

                  {/* Caractéristiques */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span>📐</span> {property.surface} m²
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🚪</span> {property.rooms} p.
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🛏️</span> {property.bedrooms} ch.
                    </span>
                  </div>

                  {/* Locataire */}
                  {property.tenant && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {property.tenant.firstName[0]}{property.tenant.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {property.tenant.firstName} {property.tenant.lastName}
                          </p>
                          <p className="text-xs text-gray-500">Locataire actuel</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}