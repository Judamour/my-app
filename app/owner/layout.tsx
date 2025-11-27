import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/layout/header'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.isOwner) {
    redirect('/tenant')
  }

  return (
    <SessionProvider session={session}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>{children}</main>
        </div>
      </ErrorBoundary>
    </SessionProvider>
  )
}