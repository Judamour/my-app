import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BackButton from '@/components/BackButton'
import ProfileEditTabs from '@/components/profile/ProfileEditTabs'
import Link from 'next/link'

export default async function ProfileEditPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Récupérer toutes les données du profil
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      birthDate: true,
      phone: true,
      address: true,
      // Préférences
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <BackButton />
          {/* 🆕 Bouton voir mon profil */}
          <Link
            href={`/profile/${session.user.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
          >
            👁️ Voir mon profil public
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            ✏️ Modifier mon profil
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et vos préférences de
            confidentialité
          </p>
        </div>

        <ProfileEditTabs userData={user} />
      </div>
    </div>
  )
}
