import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BackButton from '@/components/BackButton'
import Link from 'next/link'
import {
  calculateUserBadges,
  calculateUserRank,
  calculateLevelFromXP,
} from '@/lib/badges'
import { getBadgeById } from '@/lib/badges-config'
import RankedAvatar from '@/components/profile/RankedAvatar'
import RankBadge from '@/components/profile/RankBadge'
import ContactButton from '@/components/messages/ContactButton'


interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface DocumentAccess {
  documents: Array<{
    id: string
    type: string
    name: string
    url: string
    createdAt: Date
    verified: boolean
  }>
  accessType: 'owner' | 'application' | 'lease' | 'none'
  canView: boolean
  message?: string
  propertyTitle?: string
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
      salary: true,
      profession: true,
      companyName: true,
      contractType: true,
      currentCity: true,
      currentPostalCode: true,
      xp: true,
      level: true,
      badges: true,
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

  const userBadges = await calculateUserBadges(user.id)
  const currentLevel = calculateLevelFromXP(user.xp)
  const rankInfo = calculateUserRank(currentLevel, userBadges.length)

  const unlockedBadgesDetails = userBadges
    .map(ub => {
      const badge = getBadgeById(ub.badgeId)
      return badge ? { ...badge, unlockedAt: ub.unlockedAt } : null
    })
    .filter(Boolean)

  const isOwnProfile = session.user.id === user.id
  const currentUserId = session.user.id

  const reviewStats = user.showReviewStats
    ? await prisma.review.aggregate({
        where: { targetId: user.id },
        _avg: { rating: true },
        _count: { id: true },
      })
    : null

  const hasReviews = reviewStats?._count?.id && reviewStats._count.id > 0

  // ============================================
  // 🔐 LOGIQUE D'ACCÈS DOCUMENTS SÉCURISÉE
  // ============================================
  const getDocumentAccess = async (): Promise<DocumentAccess> => {
    // CAS 1 : Le locataire consulte ses propres documents
    if (isOwnProfile) {
      const documents = await prisma.document.findMany({
        where: {
          ownerId: id,
          leaseId: null,
        },
        orderBy: { createdAt: 'desc' },
      })

      return {
        documents,
        accessType: 'owner',
        canView: true,
      }
    }

    // Vérifier si le visiteur est propriétaire
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { isOwner: true },
    })

    if (!currentUser?.isOwner) {
      return {
        documents: [],
        accessType: 'none',
        canView: false,
        message:
          'Seuls les propriétaires peuvent consulter les documents des candidats.',
      }
    }

    // CAS 2 : Vérifier candidature PENDING ou ACCEPTED
    const applicationAccess = await prisma.application.findFirst({
      where: {
        tenantId: id,
        property: { ownerId: currentUserId },
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      include: {
        sharedDocuments: {
          include: {
            document: true,
          },
        },
        property: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // CAS 3 : Vérifier bail ACTIVE ou PENDING
    const leaseAccess = await prisma.lease.findFirst({
      where: {
        tenantId: id,
        property: { ownerId: currentUserId },
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      include: {
        property: {
          select: { title: true },
        },
      },
    })

    // AUCUN ACCÈS
    if (!applicationAccess && !leaseAccess) {
      return {
        documents: [],
        accessType: 'none',
        canView: false,
        message: "Vous n'avez pas accès aux documents de ce locataire.",
      }
    }

    // ACCÈS VIA CANDIDATURE (documents partagés uniquement)
    if (applicationAccess && applicationAccess.sharedDocuments.length > 0) {
      const sharedDocIds = applicationAccess.sharedDocuments.map(sd => sd.id)

      // Vérifier si c'est la première consultation
      const isFirstView = applicationAccess.sharedDocuments.some(
        sd => sd.viewedAt === null
      )

      // Marquer comme consultés
      await prisma.sharedDocument.updateMany({
        where: {
          id: { in: sharedDocIds },
          viewedAt: null,
        },
        data: { viewedAt: new Date() },
      })

      await prisma.sharedDocument.updateMany({
        where: { id: { in: sharedDocIds } },
        data: { viewedCount: { increment: 1 } },
      })

      // 🆕 Envoyer notification au locataire (première consultation uniquement)
      if (isFirstView) {
        // Récupérer le nom du propriétaire
        const owner = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { firstName: true, lastName: true },
        })

        if (owner) {
          await prisma.notification.create({
            data: {
              userId: id, // Le locataire
              type: 'DOCUMENTS_VIEWED',
              title: '📄 Documents consultés',
              message: `${owner.firstName} ${owner.lastName} a consulté vos documents pour "${applicationAccess.property.title}"`,
              link: `/profile/${id}`,
            },
          })
        }
      }

      return {
        documents: applicationAccess.sharedDocuments.map(sd => sd.document),
        accessType: 'application',
        canView: true,
        propertyTitle: applicationAccess.property.title,
      }
    }

    // ACCÈS VIA BAIL (tous les documents profil)
    if (leaseAccess) {
      const documents = await prisma.document.findMany({
        where: {
          ownerId: id,
          leaseId: null,
        },
        orderBy: { createdAt: 'desc' },
      })

      return {
        documents,
        accessType: 'lease',
        canView: true,
        propertyTitle: leaseAccess.property.title,
      }
    }

    // CANDIDATURE SANS DOCUMENTS PARTAGÉS
    if (applicationAccess && applicationAccess.sharedDocuments.length === 0) {
      return {
        documents: [],
        accessType: 'application',
        canView: true,
        propertyTitle: applicationAccess.property.title,
        message:
          "Le candidat n'a pas partagé de documents avec sa candidature.",
      }
    }

    return {
      documents: [],
      accessType: 'none',
      canView: false,
    }
  }

  const documentAccess = await getDocumentAccess()

  const getContractTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      CDI: 'CDI',
      CDD: 'CDD',
      INTERIM: 'Intérim',
      INDEPENDANT: 'Indépendant',
      ETUDIANT: 'Étudiant',
      RETRAITE: 'Retraité',
      AUTRE: 'Autre',
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

  const documentTypeLabels: Record<string, string> = {
    ID_CARD: "🆔 Pièce d'identité",
    PAYSLIP: '💰 Fiche de paie',
    WORK_CONTRACT: '📑 Contrat de travail',
    PROOF_ADDRESS: '🏠 Justificatif domicile',
    TAX_NOTICE: "📊 Avis d'imposition",
    BANK_STATEMENT: '🏦 RIB',
    GUARANTOR_ID: '👤 ID Garant',
    GUARANTOR_INCOME: '💼 Revenus garant',
    INSURANCE: '🛡️ Assurance',
    OTHER: '📎 Autre',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
{/* Header avec boutons */}
        <div className="mb-6 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                ✏️ Modifier mon profil
              </Link>
            ) : (
              <ContactButton
                recipientId={user.id}
                recipientName={user.firstName}
              />
            )}
          </div>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header avec avatar et infos principales */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <RankedAvatar
              firstName={user.firstName || 'U'}
              lastName={user.lastName || 'U'}
              rankInfo={rankInfo}
              showBorder={user.showRankBorder}
              size="large"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h1>

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

              {user.showLevel && <div className="mb-4"></div>}

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


          {/* Informations professionnelles */}
          {user.isTenant &&
            (user.salary ||
              user.profession ||
              user.companyName ||
              user.contractType) && (
              <div className="border-t pt-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  💼 Informations professionnelles
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.profession && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Profession
                        </span>
                        <span className="text-gray-900 font-medium">
                          {user.profession}
                        </span>
                      </div>
                    )}
                    {user.companyName && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Entreprise
                        </span>
                        <span className="text-gray-900 font-medium">
                          {user.companyName}
                        </span>
                      </div>
                    )}
                    {user.contractType && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Type de contrat
                        </span>
                        <span className="text-gray-900 font-medium">
                          {getContractTypeLabel(user.contractType)}
                        </span>
                      </div>
                    )}
                    {user.salary && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Salaire mensuel
                        </span>
                        <span className="text-gray-900 font-medium">
                          {formatSalary(user.salary)}
                        </span>
                      </div>
                    )}
                    {(user.currentCity || user.currentPostalCode) && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Adresse actuelle
                        </span>
                        <span className="text-gray-900 font-medium">
                          {user.currentCity}{' '}
                          {user.currentPostalCode &&
                            `(${user.currentPostalCode})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* ============================================ */}
          {/* 🔐 SECTION DOCUMENTS SÉCURISÉE */}
          {/* ============================================ */}
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

            {/* Contexte d'accès pour les propriétaires */}
            {!isOwnProfile &&
              documentAccess.canView &&
              documentAccess.propertyTitle && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">🔐 Accès autorisé</span> —
                    {documentAccess.accessType === 'application' && (
                      <>
                        {' '}
                        Candidature pour{' '}
                        <span className="font-medium">
                          {documentAccess.propertyTitle}
                        </span>
                      </>
                    )}
                    {documentAccess.accessType === 'lease' && (
                      <>
                        {' '}
                        Bail actif pour{' '}
                        <span className="font-medium">
                          {documentAccess.propertyTitle}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              )}

            {/* Documents disponibles avec liste détaillée */}
            {documentAccess.canView && documentAccess.documents.length > 0 ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {documentAccess.documents.length} document
                      {documentAccess.documents.length > 1 ? 's' : ''}
                      {isOwnProfile ? ' disponible' : ' partagé'}
                      {documentAccess.documents.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isOwnProfile
                        ? 'Vos documents sont sécurisés et partagés uniquement avec les propriétaires concernés'
                        : 'Documents partagés par le candidat'}
                    </p>
                  </div>
                </div>

                {/* 🆕 LISTE DÉTAILLÉE DES DOCUMENTS AVEC BOUTONS */}
                <div className="space-y-2">
                  {documentAccess.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 in-w-0 flex-1">
                        <span className="text-lg">
                          {documentTypeLabels[doc.type]?.split(' ')[0] || '📄'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate max-w-[180px] sm:max-w-[250px]">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {documentTypeLabels[doc.type]
                              ?.split(' ')
                              .slice(1)
                              .join(' ') || doc.type}
                            {doc.verified && (
                              <span className="ml-2 text-green-600">
                                ✓ Vérifié
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Voir
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : documentAccess.canView && documentAccess.message ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📭</span>
                  <p className="text-orange-800">{documentAccess.message}</p>
                </div>
              </div>
            ) : !documentAccess.canView && documentAccess.message ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="font-medium text-gray-700">Accès restreint</p>
                    <p className="text-sm text-gray-600">
                      {documentAccess.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : isOwnProfile ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <span className="text-4xl block mb-2">📭</span>
                <p className="text-gray-600">Aucun document uploadé</p>
                <Link
                  href="/profile/edit?tab=documents"
                  className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Ajouter des documents
                </Link>
              </div>
            ) : null}
          </div>

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


          {/* Badges débloqués */}
          {user.showBadges && unlockedBadgesDetails.length > 0 && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🏆 Badges débloqués ({unlockedBadgesDetails.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {unlockedBadgesDetails.map(badge => {
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

          {/* Membre depuis */}
          <div className="border-t pt-6 mt-6">
            <div className="text-sm text-gray-500 text-center">
              Membre depuis le{' '}
              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
