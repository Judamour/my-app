import { prisma } from '@/lib/prisma'

interface ReviewStatsProps {
  userId: string
}

export default async function ReviewStats({ userId }: ReviewStatsProps) {
  const reviews = await prisma.review.findMany({
    where: {
      targetId: userId,
      status: 'REVEALED',
    },
    select: {
      rating: true,
      criteria: true,
      depositReturnedPercent: true,
    },
  })

  if (reviews.length === 0) {
    return null
  }

  // Calcul moyenne globale
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  // Calcul moyenne de chaque critère
  const criteriaAverages: Record<string, number> = {}
  const criteriaCounts: Record<string, number> = {}

  reviews.forEach(review => {
    const criteria = review.criteria as Record<string, number> | null
    if (criteria) {
      Object.entries(criteria).forEach(([key, value]) => {
        if (!criteriaAverages[key]) {
          criteriaAverages[key] = 0
          criteriaCounts[key] = 0
        }
        criteriaAverages[key] += value
        criteriaCounts[key]++
      })
    }
  })

  Object.keys(criteriaAverages).forEach(key => {
    criteriaAverages[key] = criteriaAverages[key] / criteriaCounts[key]
  })

  // Taux de restitution moyenne (pour les locataires uniquement)
  const depositsData = reviews
    .filter(r => r.depositReturnedPercent !== null)
    .map(r => r.depositReturnedPercent!)

  const averageDepositReturn =
    depositsData.length > 0
      ? depositsData.reduce((sum, val) => sum + val, 0) / depositsData.length
      : null

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        📈 Statistiques de confiance
      </h3>

      {/* Note moyenne */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-xl">
        <div>
          <p className="text-sm text-gray-600">Note moyenne</p>
          <p className="text-2xl font-bold text-gray-900">
            {averageRating.toFixed(1)}/5
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`text-2xl ${
                star <= Math.round(averageRating)
                  ? 'text-yellow-400'
                  : 'text-gray-200'
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Nombre d'avis */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl mb-4">
        <p className="text-sm text-gray-600">Nombre d&apos;avis</p>
        <p className="text-xl font-bold text-gray-900">{reviews.length}</p>
      </div>

      {/* Taux de restitution (pour locataires) */}
      {averageDepositReturn !== null && (
        <div className="p-4 bg-white rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Taux de restitution caution</p>
            <p className="text-xl font-bold text-gray-900">
              {averageDepositReturn.toFixed(0)}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                averageDepositReturn >= 90
                  ? 'bg-emerald-500'
                  : averageDepositReturn >= 50
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${averageDepositReturn}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
