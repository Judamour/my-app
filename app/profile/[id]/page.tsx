import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BackButton from '@/components/BackButton'
import Link from 'next/link'
import { calculateUserBadges, calculateUserRank, calculateLevelFromXP } from '@/lib/badges'
import { getBadgeById } from '@/lib/badges-config'
import RankedAvatar from '@/components/profile/RankedAvatar'
import RankBadge from '@/components/profile/RankBadge'
import XPProgressBar from '@/components/profile/XPProgressBar'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params
  
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      gender: true,
      birthDate: true,
      profileComplete: true,
      role: true,
      isOwner: true,
      isTenant: true,
      createdAt: true,
      // 🆕 Infos professionnelles
      salary: true,
      profession: true,
      companyName: true,
      contractType: true,
      currentCity: true,
      currentPostalCode: true,
      // Gamification
      xp: true,
      level: true,
      badges: true,
      // Préférences d'affichage
      showBadges: true,
      showLevel: true,
      showRankBorder: true,
      showReviewStats: true,
      showPhone: true,
      showAddress: true,
    },
  })

  if (!user) {
    notFound()
  }

  // Calcul des badges et du rang
  const userBadges = await calculateUserBadges(user.id)
  const currentLevel = calculateLevelFromXP(user.xp)
  const rankInfo = calculateUserRank(currentLevel, userBadges.length)

  // Récupérer les détails des badges débloqués
  const unlockedBadgesDetails = userBadges
    .map((ub) => {
      const badge = getBadgeById(ub.badgeId)
      return badge ? { ...badge, unlockedAt: ub.unlockedAt } : null
    })
    .filter(Boolean)

  const isOwnProfile = session.user.id === user.id

  // Stats pour avis
  const reviewStats = user.showReviewStats
    ? await prisma.review.aggregate({
        where: { targetId: user.id },
        _avg: { rating: true },
        _count: { id: true },
      })
    : null

  const hasReviews = reviewStats?._count?.id && reviewStats._count.id > 0

  // 🆕 Récupérer les documents du profil (si propriétaire ou profil personnel)
  const canViewDocuments = isOwnProfile || session.user.isOwner
  
  const documents = canViewDocuments
    ? await prisma.document.findMany({
        where: {
          ownerId: user.id,
          leaseId: null, // Documents de profil uniquement (pas liés à un bail)
        },
        orderBy: { id: 'desc' },
        take: 20,
      })
    : []

  const hasDocuments = documents.length > 0

  // 🆕 Formater le type de contrat
  const getContractTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'INTERIM': 'Intérim',
      'INDEPENDANT': 'Indépendant',
      'ETUDIANT': 'Étudiant',
      'RETRAITE': 'Retraité',
      'AUTRE': 'Autre',
    }
    return type ? labels[type] || type : null
  }

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec boutons */}
        <div className="mb-6 flex items-center justify-between">
          <BackButton />
          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              ✏️ Modifier mon profil
            </Link>
          )}
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header avec avatar et infos principales */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            {/* Avatar avec bordure de rang */}
            <RankedAvatar
              firstName={user.firstName || 'U'}
              lastName={user.lastName || 'U'}
              rankInfo={rankInfo}
              showBorder={user.showRankBorder}
              size="large"
            />

            {/* Infos utilisateur */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h1>

              {/* Badge de rang */}
              {user.showRankBorder && rankInfo.rank !== 'NONE' && (
                <div className="mb-3">
                  <RankBadge
                    rankInfo={rankInfo}
                    level={currentLevel}
                    showLevel={user.showLevel}
                    size="medium"
                  />
                </div>
              )}

              {/* Rôles */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {user.isTenant && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    🏠 Locataire
                  </span>
                )}
                {user.isOwner && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    🏢 Propriétaire
                  </span>
                )}
                {user.role === 'ADMIN' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    👑 Admin
                  </span>
                )}
              </div>

              {/* Barre de progression XP */}
              {user.showLevel && (
                <div className="mb-4">
                  <XPProgressBar currentXP={user.xp} currentLevel={currentLevel} />
                </div>
              )}

              {/* Stats avis */}
              {user.showReviewStats && hasReviews && reviewStats && (
                <div className="flex items-center gap-4 justify-center md:justify-start text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">
                      {reviewStats._avg?.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div>•</div>
                  <div>{reviewStats._count.id} avis</div>
                </div>
              )}
            </div>
          </div>

          {/* Badges débloqués */}
          {user.showBadges && unlockedBadgesDetails.length > 0 && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🏆 Badges débloqués ({unlockedBadgesDetails.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {unlockedBadgesDetails.map((badge) => {
                  if (!badge) return null
                  return (
                    <div
                      key={badge.id}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-bold text-sm text-gray-900 mb-1">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {badge.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        +{badge.points} XP
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 🆕 Informations professionnelles (locataire) */}
          {user.isTenant && (user.salary || user.profession || user.companyName || user.contractType) && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                💼 Informations professionnelles
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.profession && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Profession</span>
                      <span className="text-gray-900 font-medium">{user.profession}</span>
                    </div>
                  )}
                  {user.companyName && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Entreprise</span>
                      <span className="text-gray-900 font-medium">{user.companyName}</span>
                    </div>
                  )}
                  {user.contractType && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Type de contrat</span>
                      <span className="text-gray-900 font-medium">
                        {getContractTypeLabel(user.contractType)}
                      </span>
                    </div>
                  )}
                  {user.salary && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Salaire mensuel</span>
                      <span className="text-gray-900 font-medium">{formatSalary(user.salary)}</span>
                    </div>
                  )}
                  {(user.currentCity || user.currentPostalCode) && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Adresse actuelle</span>
                      <span className="text-gray-900 font-medium">
                        {user.currentCity} {user.currentPostalCode && `(${user.currentPostalCode})`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🆕 Documents du profil */}
          {canViewDocuments && (
            <div className="border-t pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  📄 Documents {isOwnProfile ? '' : 'du profil'}
                </h2>
                {isOwnProfile && (
                  <Link
                    href="/profile/edit?tab=documents"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Gérer mes documents →
                  </Link>
                )}
              </div>
              
              {hasDocuments ? (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">✅</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {documents.length} document{documents.length > 1 ? 's' : ''} disponible{documents.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isOwnProfile ? 'Vos documents sont sécurisés' : 'Documents vérifiables'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Liste des types de documents */}
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(documents.map(d => d.type))).map(type => {
                      const labels: Record<string, string> = {
                        'ID_CARD': '🆔 Pièce d\'identité',
                        'PAYSLIP': '💰 Fiche de paie',
                        'WORK_CONTRACT': '📑 Contrat de travail',
                        'PROOF_ADDRESS': '🏠 Justificatif domicile',
                        'TAX_NOTICE': '📊 Avis d\'imposition',
                        'BANK_STATEMENT': '🏦 RIB',
                        'GUARANTOR_ID': '👤 ID Garant',
                        'GUARANTOR_INCOME': '💼 Revenus garant',
                        'INSURANCE': '🛡️ Assurance',
                        'OTHER': '📎 Autre',
                      }
                      return (
                        <span
                          key={type}
                          className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs font-medium border border-gray-200"
                        >
                          {labels[type] || type}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <span className="text-4xl block mb-2">📭</span>
                  <p className="text-gray-600">
                    {isOwnProfile ? 'Aucun document uploadé' : 'Aucun document disponible'}
                  </p>
                  {isOwnProfile && (
                    <Link
                      href="/profile/edit?tab=documents"
                      className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Ajouter des documents
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Informations de contact */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📞 Informations de contact
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium w-32">Email :</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              {user.showPhone && user.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-medium w-32">
                    Téléphone :
                  </span>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              )}
              {user.showAddress && user.address && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-medium w-32">
                    Adresse :
                  </span>
                  <span className="text-gray-900">{user.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations personnelles */}
          {(user.gender || user.birthDate) && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                👤 Informations personnelles
              </h2>
              <div className="space-y-3">
                {user.gender && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-32">
                      Genre :
                    </span>
                    <span className="text-gray-900">
                      {user.gender === 'MALE'
                        ? 'Homme'
                        : user.gender === 'FEMALE'
                        ? 'Femme'
                        : 'Autre'}
                    </span>
                  </div>
                )}
                {user.birthDate && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-32">
                      Date de naissance :
                    </span>
                    <span className="text-gray-900">
                      {new Date(user.birthDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Membre depuis */}
          <div className="border-t pt-6 mt-6">
            <div className="text-sm text-gray-500 text-center">
              Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}