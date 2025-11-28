import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BackButton from '@/components/BackButton'
import ProfileEditTabs from '@/components/profile/ProfileEditTabs'
import Link from 'next/link'

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const params = await searchParams
  const activeTab = params.tab || 'general'

  // Récupérer TOUTES les données du profil
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      // Identité
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      
      // Informations générales
      gender: true,
      birthDate: true,
      phone: true,
      address: true,
      
      // Informations professionnelles (locataire)
      salary: true,
      profession: true,
      companyName: true,
      contractType: true,
      currentCity: true,
      currentPostalCode: true,
      
      // Rôles
      isOwner: true,
      isTenant: true,
      
      // Préférences de confidentialité
      showBadges: true,
      showLevel: true,
      showRankBorder: true,
      showReviewStats: true,
      showPhone: true,
      showAddress: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <BackButton />
            <Link
              href={`/profile/${session.user.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-700 font-medium text-sm"
            >
              <span>👁️</span>
              <span>Voir mon profil public</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Modifier mon profil
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et vos documents
          </p>
        </div>

        <ProfileEditTabs userData={user} activeTab={activeTab} />
      </div>
    </div>
  )
}