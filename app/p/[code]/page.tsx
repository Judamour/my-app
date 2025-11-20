import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function PassportPreviewPage({ params }: PageProps) {
  const { code } = await params
  
  // Récupérer le lien de partage
  const shareLink = await prisma.shareLink.findUnique({
    where: { shortCode: code },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileComplete: true,
          createdAt: true,
        },
      },
    },
  })

  if (!shareLink || shareLink.type !== 'PROFILE' || !shareLink.user) {
    notFound()
  }

  // Incrémenter les vues
  await prisma.shareLink.update({
    where: { id: shareLink.id },
    data: { views: { increment: 1 } },
  })

  const user = shareLink.user
  const session = await auth()

  // Si connecté et propriétaire → Rediriger vers le profil complet
  if (session?.user) {
    redirect(`/profile/${user.id}`)
  }

  // Calculer l'ancienneté
  const memberSince = new Date(user.createdAt)
  const now = new Date()
  const monthsDiff = (now.getFullYear() - memberSince.getFullYear()) * 12 + 
                     (now.getMonth() - memberSince.getMonth())
  
  const memberDuration = monthsDiff < 1 
    ? 'Nouveau membre' 
    : monthsDiff < 12 
      ? `Membre depuis ${monthsDiff} mois`
      : `Membre depuis ${Math.floor(monthsDiff / 12)} an${Math.floor(monthsDiff / 12) > 1 ? 's' : ''}`

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-lg mx-auto px-6 py-4">
          <p className="text-sm text-gray-500 text-center">Passport de confiance</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        {/* Avatar & Nom */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-orange-300 rounded-full flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {user.firstName} {user.lastName[0]}.
          </h1>
          <p className="text-gray-500 mt-1">{memberDuration}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {user.profileComplete && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
              ✓ Profil complet
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
            ✓ Email vérifié
          </span>
        </div>

        {/* Stats aperçu */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">⭐</p>
            <p className="text-sm text-gray-500 mt-1">Avis</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">🏠</p>
            <p className="text-sm text-gray-500 mt-1">Locations</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">🏆</p>
            <p className="text-sm text-gray-500 mt-1">Badges</p>
          </div>
        </div>

        {/* Message de confiance */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-center">
          <p className="text-gray-600">
            &quot;{user.firstName} a partagé son passport de confiance avec vous pour faciliter votre relation locative.&quot;
          </p>
        </div>

        {/* Bloc CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vous êtes propriétaire ?
          </h2>
          <p className="text-gray-600 mb-6">
            Créez votre compte pour voir le profil complet, les avis détaillés et gérer vos biens.
          </p>
          
          <Link
            href={`/register?role=owner&redirect=/profile/${user.id}&ref=${code}`}
            className="inline-block w-full max-w-xs px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Créer mon compte propriétaire
          </Link>
          
          <p className="mt-4">
            <Link
              href={`/login?redirect=/profile/${user.id}`}
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <p className="text-center text-sm text-gray-400 mt-8">
          🔒 Données sécurisées • Inscription gratuite
        </p>
      </div>
    </div>
  )
}