import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function PropertiesListPage() {
  const session = await requireOwner()
  
  // Fetch directement avec Prisma
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mes Propriétés
              </h1>
              <p className="text-gray-600 mt-1">
                Bonjour {session.user.firstName} {session.user.lastName}
              </p>
            </div>
            <Link
              href="/owner/properties/new"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
            >
              + Ajouter une propriété
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {properties.length === 0 ? (
          // Aucune propriété
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Aucune propriété
            </h2>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre première propriété
            </p>
            <Link
              href="/owner/properties/new"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Ajouter ma première propriété
            </Link>
          </div>
        ) : (
          // Grille de propriétés
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {/* Badge disponibilité */}
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 flex-1">
                      {property.title}
                    </h3>
                    {property.available ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Disponible
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        Occupé
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{property.address}</p>
                </div>

                {/* Infos */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {property.rent}€
                      <span className="text-sm text-gray-500 font-normal">/mois</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
                    <div>
                      <div className="font-medium text-gray-800">{property.surface}m²</div>
                      <div className="text-xs">Surface</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{property.rooms}</div>
                      <div className="text-xs">Pièces</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{property.bedrooms}</div>
                      <div className="text-xs">Chambres</div>
                    </div>
                  </div>

                  {/* Locataire */}
                  {property.tenant && (
                    <div className="bg-gray-50 rounded p-2 mb-4 text-sm">
                      <span className="text-gray-600">Locataire : </span>
                      <span className="font-medium">
                        {property.tenant.firstName} {property.tenant.lastName}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/owner/properties/${property.id}`}
                      className="flex-1 text-center bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 text-sm font-medium"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/owner/properties/${property.id}/edit`}
                      className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 text-sm font-medium"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
