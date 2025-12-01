import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ApplyButton from '@/components/properties/ApplyButton'
import ImageGallery from '@/components/properties/ImageGallery'
import ContactButton from '@/components/messages/ContactButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyPublicPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  // Si pas connecté, rediriger vers login
  if (!session?.user) {
    redirect(`/login?redirect=/properties/${id}`)
  }

  // Récupérer la propriété
  const property = await prisma.property.findUnique({
    where: {
      id,
      deletedAt: null, // 🆕 Exclure les supprimées
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      },
    },
  })

  if (!property) {
    notFound()
  }

  // Si c'est mon propre bien, rediriger vers la page owner
  if (property.ownerId === session.user.id) {
    redirect(`/owner/properties/${id}`)
  }

  // Vérifier si déjà postulé (mais permettre si le bail est terminé)
  const existingApplication = await prisma.application.findFirst({
    where: {
      propertyId: id,
      tenantId: session.user.id,
    },
  })

  // Vérifier si un bail existe pour cette propriété
  const existingLease = await prisma.lease.findFirst({
    where: {
      tenantId: session.user.id,
      property: { id },
    },
    select: { status: true },
  })

  // Si le bail est terminé, on peut repostuler (ignorer l'ancienne candidature)
  const canReapply = existingLease?.status === 'ENDED'
  const showExistingApplication = existingApplication && !canReapply

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

  // Ancienneté du propriétaire
  const memberSince = new Date(property.owner.createdAt)
  const now = new Date()
  const monthsDiff =
    (now.getFullYear() - memberSince.getFullYear()) * 12 +
    (now.getMonth() - memberSince.getMonth())
  const memberDuration =
    monthsDiff < 12
      ? `Membre depuis ${monthsDiff || 1} mois`
      : `Membre depuis ${Math.floor(monthsDiff / 12)} an${
          Math.floor(monthsDiff / 12) > 1 ? 's' : ''
        }`

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link
            href="/tenant"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Mon espace
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Images */}
        <div className="mb-8">
          <ImageGallery images={property.images || []} title={property.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            {/* Titre & Type */}
            <div className="mb-6">
              <p className="text-gray-500 mb-1">
                {getPropertyType(property.type)}
              </p>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                {property.title}
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
                📍 {property.city} ({property.postalCode})
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="flex gap-6 py-6 border-y border-gray-100 mb-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {property.surface}
                </p>
                <p className="text-sm text-gray-500">m²</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {property.rooms}
                </p>
                <p className="text-sm text-gray-500">pièces</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {property.bedrooms}
                </p>
                <p className="text-sm text-gray-500">chambres</p>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Propriétaire */}
            <div className="p-6 bg-gray-50 rounded-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Proposé par
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {property.owner.firstName[0]}
                  {property.owner.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {property.owner.firstName}
                  </p>
                  <p className="text-sm text-gray-500">{memberDuration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Candidature */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 border border-gray-200 rounded-2xl p-6 shadow-lg">
              {/* Prix */}
              <div className="mb-6">
                <p className="text-3xl font-semibold text-gray-900">
                  {formatPrice(property.rent)}
                  <span className="text-lg text-gray-400 font-normal">
                    /mois
                  </span>
                </p>
              </div>

              {/* Statut candidature */}
              {showExistingApplication ? (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <p className="font-medium text-blue-800 flex items-center gap-2">
                    <span>📝</span>
                    Candidature envoyée
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Statut :{' '}
                    {existingApplication!.status === 'PENDING'
                      ? 'En attente'
                      : existingApplication!.status === 'ACCEPTED'
                        ? 'Acceptée ✅'
                        : 'Refusée ❌'}
                  </p>
                </div>
              ) : !property.available ? (
                <div className="mb-6 p-4 bg-orange-50 rounded-xl">
                  <p className="font-medium text-orange-800 flex items-center gap-2">
                    <span>🔒</span>
                    Bien non disponible
                  </p>
                </div>
              ) : (
                <ApplyButton propertyId={property.id} />
              )}

              {/* 🆕 Bouton Contact */}
              <div className="mt-4">
                <ContactButton
                  recipientId={property.owner.id}
                  recipientName={property.owner.firstName}
                  propertyId={property.id}
                />
              </div>

              {/* Infos */}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <p className="text-xs text-gray-400 text-center">
                  🔒 L&apos;adresse exacte sera communiquée si votre candidature
                  est acceptée
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
