import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireOwner()
  const { id } = await params

  const property = await prisma.property.findUnique({
    where: { id },
  })

  if (!property) {
    notFound()
  }

  if (property.ownerId !== session.user.id) {
    redirect('/owner/properties')
  }

  // Helper pour formater les montants
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Helper pour le type de bien
  const getPropertyType = (type: string) => {
    const types = {
      APARTMENT: 'Appartement',
      HOUSE: 'Maison',
      STUDIO: 'Studio',
      ROOM: 'Chambre',
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header avec breadcrumb */}
        <div className="mb-6">
          <Link
            href="/owner/properties"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Retour à mes propriétés
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <p className="text-gray-600">{property.address}</p>
            </div>
            {/* Badge disponibilité */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                property.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {property.available ? 'Disponible' : 'Loué'}
            </span>
          </div>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Section infos principales */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations générales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Type de bien</p>
                <p className="text-base text-gray-900 font-medium">
                  {getPropertyType(property.type)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Loyer mensuel</p>
                <p className="text-base text-gray-900 font-medium">
                  {formatPrice(property.rent)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Surface</p>
                <p className="text-base text-gray-900 font-medium">
                  {property.surface} m²
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Nombre de pièces</p>
                <p className="text-base text-gray-900 font-medium">
                  {property.rooms} {property.rooms > 1 ? 'pièces' : 'pièce'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Chambres</p>
                <p className="text-base text-gray-900 font-medium">
                  {property.bedrooms}{' '}
                  {property.bedrooms > 1 ? 'chambres' : 'chambre'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Disponibilité</p>
                <p className="text-base text-gray-900 font-medium">
                  {property.available
                    ? 'Disponible à la location'
                    : 'Actuellement loué'}
                </p>
              </div>
            </div>
          </div>

          {/* Section description */}
          {property.description && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}

          {/* Section dates */}
          <div className="p-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations système
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Date de création</p>
                <p className="text-gray-900">
                  {new Date(property.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Dernière modification</p>
                <p className="text-gray-900">
                  {new Date(property.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          {property.available ? (
            // ✅ Bien disponible → Bouton actif
            <Link
              href={`/owner/properties/${property.id}/edit`}
              className="
        flex-1 
        px-6 py-3 
        bg-blue-500 text-white 
        text-center
        rounded-lg font-medium
        hover:bg-blue-600
      "
            >
              Modifier
            </Link>
          ) : (
            // ❌ Bien loué → Bouton désactivé
            <div
              className="
        flex-1 
        px-6 py-3 
        bg-gray-300 text-gray-500 
        text-center
        rounded-lg font-medium
        cursor-not-allowed
      "
              title="Impossible de modifier un bien loué"
            >
              Modifier
            </div>
          )}

          <button
            disabled={!property.available}
            className={`
      px-6 py-3 
      rounded-lg font-medium
      ${
        property.available
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }
    `}
            title={
              property.available
                ? 'Supprimer ce bien'
                : 'Impossible de supprimer un bien loué'
            }
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
