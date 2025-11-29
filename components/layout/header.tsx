'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import NotificationBell from '@/components/notifications/NotificationBell'
import UnreadMessagesButton from '@/components/messages/UnreadMessagesButton'
import LogoutButton from '@/components/LogoutButton'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  if (!session) {
    return null
  }

  const user = session.user
  const isOwner = pathname.startsWith('/owner')
  const isTenant = pathname.startsWith('/tenant')

  // Afficher le switch seulement si l'utilisateur a les 2 rôles
  const showRoleSwitch = user.isOwner && user.isTenant

  const handleRoleSwitch = () => {
    if (isOwner) {
      router.push('/tenant')
    } else if (isTenant) {
      router.push('/owner')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={user.isOwner ? '/owner' : '/tenant'}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Renty</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {isOwner ? (
              <>
                <NavLink href="/owner" active={pathname === '/owner'}>
                  Dashboard
                </NavLink>
                <NavLink
                  href="/owner/properties"
                  active={pathname.startsWith('/owner/properties')}
                >
                  Propriétés
                </NavLink>
                <NavLink
                  href="/owner/applications"
                  active={pathname.startsWith('/owner/applications')}
                >
                  Candidatures
                </NavLink>
                <NavLink
                  href="/owner/leases"
                  active={pathname.startsWith('/owner/leases')}
                >
                  Baux
                </NavLink>
                <NavLink
                  href="/owner/receipts"
                  active={pathname.startsWith('/owner/receipts')}
                >
                  Paiements
                </NavLink>
              </>
            ) : (
              isTenant && (
                <>
                  <NavLink href="/tenant" active={pathname === '/tenant'}>
                    Dashboard
                  </NavLink>
                  <NavLink
                    href="/tenant/applications"
                    active={pathname.startsWith('/tenant/applications')}
                  >
                    Candidatures
                  </NavLink>
                  <NavLink
                    href="/tenant/leases"
                    active={pathname.startsWith('/tenant/leases')}
                  >
                    Baux
                  </NavLink>
                  <NavLink
                    href="/tenant/receipts"
                    active={pathname.startsWith('/tenant/receipts')}
                  >
                    Quittances
                  </NavLink>
                </>
              )
            )}

            <NavLink href="/messages" active={pathname.startsWith('/messages')}>
              Messages
            </NavLink>

            <NavLink
              href="/achievements"
              active={pathname.startsWith('/achievements')}
            >
              Succès
            </NavLink>
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Switch Role (si double rôle) */}
            {showRoleSwitch && (
              <button
                onClick={handleRoleSwitch}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-medium"
                title={
                  isOwner
                    ? 'Passer en mode locataire'
                    : 'Passer en mode propriétaire'
                }
              >
                <span className="text-lg">{isOwner ? '🔑' : '🏠'}</span>
                <span className="hidden xl:inline">
                  {isOwner ? 'Mode locataire' : 'Mode propriétaire'}
                </span>
              </button>
            )}

            {/* Messages - masqué sur très petit écran */}
            <div className="hidden xs:block">
              <UnreadMessagesButton userId={user.id} />
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Profil avec dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden xl:block">
                  {user.firstName}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showMobileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMobileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                    {/* Profil */}
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Voir mon profil</p>
                      </div>
                    </Link>

                    {/* Switch Role Mobile */}
                    {showRoleSwitch && (
                      <>
                        <div className="border-t border-gray-200" />
                        <button
                          onClick={() => {
                            handleRoleSwitch()
                            setShowMobileMenu(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="text-2xl">
                            {isOwner ? '🔑' : '🏠'}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {isOwner ? 'Mode locataire' : 'Mode propriétaire'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Changer de rôle
                            </p>
                          </div>
                        </button>
                      </>
                    )}

                    <div className="border-t border-gray-200" />

                    {/* Messages mobile */}
                    <Link
                      href="/messages"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors lg:hidden"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="text-xl">💬</span>
                      <span className="text-sm font-medium text-gray-700">
                        Messages
                      </span>
                    </Link>

                    {/* Succès mobile */}
                    <Link
                      href="/achievements"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors lg:hidden"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="text-xl">🏆</span>
                      <span className="text-sm font-medium text-gray-700">
                        Mes succès
                      </span>
                    </Link>

                    <div className="border-t border-gray-200" />

                    {/* Déconnexion */}
                    <div className="px-4 py-3">
                      <LogoutButton />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      <div className="lg:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto px-4 py-2 gap-1 scrollbar-hide">
          {isOwner ? (
            <>
              <MobileNavLink href="/owner" active={pathname === '/owner'}>
                📊 Dashboard
              </MobileNavLink>
              <MobileNavLink
                href="/owner/properties"
                active={pathname.startsWith('/owner/properties')}
              >
                🏠 Propriétés
              </MobileNavLink>
              <MobileNavLink
                href="/owner/applications"
                active={pathname.startsWith('/owner/applications')}
              >
                📝 Candidatures
              </MobileNavLink>
              <MobileNavLink
                href="/owner/leases"
                active={pathname.startsWith('/owner/leases')}
              >
                📄 Baux
              </MobileNavLink>
            </>
          ) : (
            isTenant && (
              <>
                <MobileNavLink href="/tenant" active={pathname === '/tenant'}>
                  📊 Dashboard
                </MobileNavLink>
                <MobileNavLink
                  href="/tenant/applications"
                  active={pathname.startsWith('/tenant/applications')}
                >
                  📝 Candidatures
                </MobileNavLink>
                <MobileNavLink
                  href="/tenant/leases"
                  active={pathname.startsWith('/tenant/leases')}
                >
                  📄 Baux
                </MobileNavLink>
              </>
            )
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
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  )
}
