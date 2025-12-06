// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pages publiques - pas de vérification d'auth
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/properties',
    '/verify-email',
    '/auth/callback',
  ]

  // Vérifier si c'est une page publique ou une ressource statique
  const isPublicPath = publicPaths.some(
    path => pathname === path || pathname.startsWith(path + '/')
  )
  const isStaticOrApi =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')

  // Rafraîchir la session Supabase (important pour garder la session active)
  const { supabaseResponse, user } = await updateSession(request)

  // Pages publiques → continuer
  if (isPublicPath || isStaticOrApi) {
    // Exception : /owner et /tenant ne sont jamais publics
    if (!pathname.startsWith('/owner') && !pathname.startsWith('/tenant')) {
      return supabaseResponse
    }
  }

  // Non connecté → login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Pour les routes /owner et /tenant, la vérification des rôles
  // est faite dans les layouts car on a besoin des données Prisma

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
