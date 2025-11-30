import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface ReviewButtonProps {
  leaseId: string
  userId: string
  leaseStatus: string
  variant?: 'banner' | 'button' | 'card'
}

export default async function ReviewButton({
  leaseId,
  userId,
  leaseStatus,
  variant = 'button',
}: ReviewButtonProps) {
  // Ne rien afficher si le bail n'est pas terminé
  if (leaseStatus !== 'ENDED') {
    return null
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      leaseId_authorId: {
        leaseId,
        authorId: userId,
      },
    },
  })

  // Avis déjà soumis
  if (existingReview) {
    if (variant === 'banner') {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="font-medium text-emerald-800">Avis soumis !</p>
              <p className="text-sm text-emerald-600">
                {existingReview.status === 'REVEALED'
                  ? 'Votre avis a été publié'
                  : "Sera révélé quand l'autre partie aura aussi évalué"}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
        <span className="text-emerald-600">✅</span>
        <p className="text-sm text-emerald-700 font-medium">
          {existingReview.status === 'REVEALED'
            ? 'Avis publié'
            : 'Avis soumis'}
        </p>
      </div>
    )
  }

  // Variant Banner - Très visible en haut de page
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-3xl">⭐</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Bail terminé - Donnez votre avis !</h3>
              <p className="text-amber-100 text-sm">
                Partagez votre expérience pour aider la communauté
              </p>
            </div>
          </div>
          <Link
            href={`/leases/${leaseId}/review`}
            className="w-full sm:w-auto px-6 py-3 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors text-center"
          >
            Laisser un avis
          </Link>
        </div>
      </div>
    )
  }

  // Variant Card - Pour la sidebar
  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-xl">⭐</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Donnez votre avis</p>
            <p className="text-xs text-gray-500">Aidez la communauté</p>
          </div>
        </div>
        <Link
          href={`/leases/${leaseId}/review`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          Laisser un avis
        </Link>
      </div>
    )
  }

  // Variant Button - Simple
  return (
    <Link
      href={`/leases/${leaseId}/review`}
      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
    >
      <span>⭐</span>
      Laisser un avis
    </Link>
  )
}