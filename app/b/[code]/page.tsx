import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function PropertyPreviewPage({ params }: PageProps) {
  const { code } = await params
  
  // Récupérer le lien de partage
  const shareLink = await prisma.shareLink.findUnique({
    where: { shortCode: code },
    include: {
      property: {
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  if (!shareLink || shareLink.type !== 'PROPERTY' || !shareLink.property) {
    notFound()
  }

  // Incrémenter les vues
  await prisma.shareLink.update({
    where: { id: shareLink.id },
    data: { views: { increment: 1 } },
  })

  const property = shareLink.property
  const session = await auth()

  // Si connecté et locataire → Rediriger vers la fiche complète
  if (session?.user) {
    redirect(`/properties/${property.id}`)
  }

  // Formater le prix
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <p className="text-sm text-gray-500">Aperçu du bien</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Images */}
        <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-8">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="text-6xl">🏠</span>
            </div>
          )}
          
          {/* Badge nombre de photos */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
              📷 {property.images.length} photos
            </div>
          )}
        </div>

        {/* Infos principales */}
        <div className="mb-8">
          <p className="text-3xl font-semibold text-gray-900 mb-2">
            {formatPrice(property.rent)}<span className="text-lg text-gray-500">/mois</span>
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {property.title}
          </h1>
          <p className="text-gray-500">
            📍 {property.address.split(',')[0]}... <span className="text-gray-400">(ville masquée)</span>
          </p>
        </div>

        {/* Caractéristiques */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{property.surface}</p>
            <p className="text-sm text-gray-500">m²</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{property.rooms}</p>
            <p className="text-sm text-gray-500">pièces</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{property.bedrooms}</p>
            <p className="text-sm text-gray-500">chambres</p>
          </div>
        </div>

        {/* Propriétaire */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
            {property.owner.firstName[0]}{property.owner.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Proposé par {property.owner.firstName}
            </p>
            <p className="text-sm text-gray-500">Propriétaire vérifié</p>
          </div>
        </div>

        {/* Bloc CTA */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-8 text-center border border-rose-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Intéressé par ce bien ?
          </h2>
          <p className="text-gray-600 mb-6">
            Créez votre compte locataire pour voir l&apos;adresse complète, toutes les photos et postuler.
          </p>
          
          <Link
            href={`/register?role=tenant&redirect=/properties/${property.id}&ref=${code}`}
            className="inline-block w-full max-w-xs px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Créer mon compte locataire
          </Link>
          
          <p className="mt-4">
            <Link
              href={`/login?redirect=/properties/${property.id}`}
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <p className="text-center text-sm text-gray-400 mt-8">
          🔒 Vos données sont protégées • Inscription gratuite
        </p>
      </div>
    </div>
  )
}