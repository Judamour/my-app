'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/notifications/NotificationBell'
import UnreadMessagesButton from '@/components/messages/UnreadMessagesButton'
import LogoutButton from '@/components/LogoutButton'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) {
    return null
  }

  const user = session.user
  const isOwner = pathname.startsWith('/owner')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href={user.isOwner ? '/owner' : '/tenant'} 
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              RentEasy
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isOwner ? (
              <>
                <NavLink href="/owner" active={pathname === '/owner'}>
                  Dashboard
                </NavLink>
                <NavLink href="/owner/properties" active={pathname.startsWith('/owner/properties')}>
                  Propriétés
                </NavLink>
                <NavLink href="/owner/applications" active={pathname.startsWith('/owner/applications')}>
                  Candidatures
                </NavLink>
                <NavLink href="/owner/leases" active={pathname.startsWith('/owner/leases')}>
                  Baux
                </NavLink>
                <NavLink href="/owner/receipts" active={pathname.startsWith('/owner/receipts')}>
                  Paiements
                </NavLink>
              </>
            ) : (
              <>
                <NavLink href="/tenant" active={pathname === '/tenant'}>
                  Dashboard
                </NavLink>
                <NavLink href="/tenant/applications" active={pathname.startsWith('/tenant/applications')}>
                  Candidatures
                </NavLink>
                <NavLink href="/tenant/leases" active={pathname.startsWith('/tenant/leases')}>
                  Baux
                </NavLink>
                <NavLink href="/tenant/receipts" active={pathname.startsWith('/tenant/receipts')}>
                  Quittances
                </NavLink>
              </>
            )}

            <NavLink href="/messages" active={pathname.startsWith('/messages')}>
              Messages
            </NavLink>
            
            <NavLink href="/achievements" active={pathname.startsWith('/achievements')}>
              Succès
            </NavLink>
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            {/* Messages */}
            <UnreadMessagesButton />

            {/* Notifications */}
            <NotificationBell />

            {/* Profil */}
            <Link
              href={`/profile/${user.id}`}
              className="hidden sm:flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden lg:block">
                {user.firstName}
              </span>
            </Link>

            {/* Logout */}
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto px-4 py-2 gap-1">
          {isOwner ? (
            <>
              <MobileNavLink href="/owner" active={pathname === '/owner'}>
                📊 Dashboard
              </MobileNavLink>
              <MobileNavLink href="/owner/properties" active={pathname.startsWith('/owner/properties')}>
                🏠 Propriétés
              </MobileNavLink>
              <MobileNavLink href="/owner/applications" active={pathname.startsWith('/owner/applications')}>
                📝 Candidatures
              </MobileNavLink>
              <MobileNavLink href="/owner/leases" active={pathname.startsWith('/owner/leases')}>
                📄 Baux
              </MobileNavLink>
            </>
          ) : (
            <>
              <MobileNavLink href="/tenant" active={pathname === '/tenant'}>
                📊 Dashboard
              </MobileNavLink>
              <MobileNavLink href="/tenant/applications" active={pathname.startsWith('/tenant/applications')}>
                📝 Candidatures
              </MobileNavLink>
              <MobileNavLink href="/tenant/leases" active={pathname.startsWith('/tenant/leases')}>
                📄 Baux
              </MobileNavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// Composants helpers
function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  )
}