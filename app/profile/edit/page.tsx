import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      birthDate: true,
      phone: true,
      address: true,
      salary: true,
      profession: true,
      companyName: true,
      contractType: true,
      currentCity: true,
      currentPostalCode: true,
      isOwner: true,
      isTenant: true,
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ✏️ Modifier mon profil
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos informations personnelles et vos documents
            </p>
          </div>
          <Link
            href={`/profile/${session.user.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <span>👁️</span>
            <span>Voir mon profil public</span>
          </Link>
        </div>

        <ProfileEditTabs userData={user} activeTab={activeTab} />
      </div>
    </div>
  )
}