import { redirect } from 'next/navigation'
import Header from '@/components/layout/header'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { UserProvider } from '@/components/providers/UserProvider'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isOwner: true,
      isTenant: true,
      emailVerified: true,
      avatar: true,
    },
  })

  if (!dbUser?.isOwner) {
    redirect('/tenant')
  }

  return (
    <UserProvider initialUser={dbUser}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>{children}</main>
        </div>
      </ErrorBoundary>
    </UserProvider>
  )
}