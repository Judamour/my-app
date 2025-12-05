import { requireOwner } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import DeletePropertyButton from '@/components/properties/DeletePropertyButton'
import ImageCarousel from '@/components/properties/ImageCarousel'
import ShareButton from '@/components/ShareButton'

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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPropertyType = (type: string) => {
    const types: Record<string, string> = {
      APARTMENT: 'Appartement',
      HOUSE: 'Maison',
      STUDIO: 'Studio',
      ROOM: 'Chambre',
      PARKING: 'Parking',
      OFFICE: 'Bureau',
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link
            href="/owner/properties"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mes propriétés
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Titre & Badge */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {property.title}
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
               <span>📍</span> {property.address}, {property.city} {property.postalCode}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              property.available
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-orange-50 text-orange-700'
            }`}
          >
            {property.available ? '✅ Disponible' : '🔒 Loué'}
          </span>
        </div>

        {/* Carrousel d'images */}
        {property.images && property.images.length > 0 ? (
          <div className="mb-10">
            <ImageCarousel images={property.images} title={property.title} />
          </div>
        ) : (
          <div className="mb-10 bg-gray-50 rounded-2xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">🏠</span>
              <p className="text-gray-400 mt-4">Aucune photo</p>
            </div>
          </div>
        )}

        {/* Prix & Actions rapides */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 p-6 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-sm text-gray-500 mb-1">Loyer mensuel</p>
            <p className="text-4xl font-semibold text-gray-900">
              {formatPrice(property.rent)}
              <span className="text-lg text-gray-400 font-normal">/mois</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ShareButton type="PROPERTY" propertyId={property.id} />
            {property.available && (
              <Link
                href={`/owner/properties/${property.id}/edit`}
                className="text-gray-700 flex items-center gap-2 px-5 py-3 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                ✏️ Modifier
              </Link>
            )}
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Caractéristiques
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <span className="text-3xl">🏢</span>
              <p className="text-xl font-semibold text-gray-900 mt-2">
                {getPropertyType(property.type)}
              </p>
              <p className="text-sm text-gray-500">Type</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <span className="text-3xl">📐</span>
              <p className="text-xl font-semibold text-gray-900 mt-2">
                {property.surface} m²
              </p>
              <p className="text-sm text-gray-500">Surface</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <span className="text-3xl">🚪</span>
              <p className="text-xl font-semibold text-gray-900 mt-2">
                {property.rooms}
              </p>
              <p className="text-sm text-gray-500">Pièces</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <span className="text-3xl">🛏️</span>
              <p className="text-xl font-semibold text-gray-900 mt-2">
                {property.bedrooms}
              </p>
              <p className="text-sm text-gray-500">Chambres</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          </div>
        )}

        {/* Infos système */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span>📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Créé le</p>
                <p className="font-medium text-gray-900">
                  {new Date(property.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span>🔄</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Modifié le</p>
                <p className="font-medium text-gray-900">
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

        {/* Zone danger */}
        <div className="border border-red-100 rounded-2xl p-6 bg-red-50/30">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Zone de danger
          </h2>
          <p className="text-sm text-red-600 mb-4">
            La suppression est irréversible. Toutes les données liées seront perdues.
          </p>
          <DeletePropertyButton
            propertyId={property.id}
            propertyTitle={property.title}
            isAvailable={property.available}
          />
        </div>
      </div>
    </div>
  )
}