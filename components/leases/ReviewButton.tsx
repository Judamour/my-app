import { prisma } from '@/lib/prisma'

interface ReviewButtonProps {
  leaseId: string
  userId: string
  leaseStatus: string
}

export default async function ReviewButton({
  leaseId,
  userId,
  leaseStatus,
}: ReviewButtonProps) {
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

  if (existingReview) {
    return (
      <div className="mt-6 bg-emerald-50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600">✅</span>
          <p className="text-sm text-emerald-700 font-medium">
            {existingReview.status === 'REVEALED'
              ? 'Votre avis a été publié'
              : "Votre avis a été soumis et sera révélé une fois que l'autre partie aura également évalué"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <a
      href={`/leases/${leaseId}/review`}
      className="mt-6 flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
    >
      <span>⭐</span>
      Laisser un avis
    </a>
  )
}
