// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  })
  
  const { pathname } = request.nextUrl

  // Pages publiques - pas de vérification
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/properties',
  ]
  
  // Vérifier si c'est une page publique ou une ressource statique
  if (
    publicPaths.some(path => pathname === path || pathname.startsWith(path + '/')) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    // Exception : /properties/[id] est public mais pas /properties/new etc côté owner
    if (!pathname.startsWith('/owner') && !pathname.startsWith('/tenant')) {
      return NextResponse.next()
    }
  }

  // Non connecté → login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isOwner = token.isOwner as boolean
  const isTenant = token.isTenant as boolean
  const hasNoRole = !isOwner && !isTenant

  // 🔒 Accès /owner sans rôle owner
  if (pathname.startsWith('/owner') && !isOwner) {
    if (hasNoRole) {
      return NextResponse.redirect(new URL('/profile/complete', request.url))
    }
    // A le rôle tenant mais pas owner
    return NextResponse.redirect(new URL('/tenant', request.url))
  }

  // 🔒 Accès /tenant sans rôle tenant
  if (pathname.startsWith('/tenant') && !isTenant) {
    if (hasNoRole) {
      return NextResponse.redirect(new URL('/profile/complete', request.url))
    }
    // A le rôle owner mais pas tenant
    return NextResponse.redirect(new URL('/owner', request.url))
  }

  // 🔒 Accès /profile/complete avec déjà un rôle → rediriger vers dashboard
  if (pathname === '/profile/complete' && !hasNoRole) {
    if (isOwner) {
      return NextResponse.redirect(new URL('/owner', request.url))
    }
    return NextResponse.redirect(new URL('/tenant', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}