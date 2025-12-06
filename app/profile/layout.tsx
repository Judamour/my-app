import Header from '@/components/layout/header'
import { UserProvider } from '@/components/providers/UserProvider'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ProfileLayout({
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

  return (
    <UserProvider initialUser={dbUser}>
      <Header />
      {children}
    </UserProvider>
  )
}