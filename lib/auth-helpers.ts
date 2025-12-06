import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Type pour la session utilisateur retournée par les helpers
export interface UserSession {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isOwner: boolean
    isTenant: boolean
    profileComplete: boolean
  }
}

/**
 * Vérifie que l'utilisateur est connecté
 * Si non connecté → Redirect vers /login
 */
export async function requireAuth(): Promise<UserSession> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isOwner: true,
      isTenant: true,
      profileComplete: true,
    }
  })

  if (!dbUser) {
    redirect('/login')
  }

  return { user: dbUser }
}

/**
 * Vérifie que l'utilisateur est un propriétaire
 * Si pas propriétaire → Redirect vers /profile/complete
 */
export async function requireOwner(): Promise<UserSession> {
  const session = await requireAuth()

  if (!session.user.isOwner) {
    redirect('/profile/complete?required=owner')
  }

  return session
}

/**
 * Vérifie que l'utilisateur est un locataire
 * Si pas locataire → Redirect vers /profile/complete
 */
export async function requireTenant(): Promise<UserSession> {
  const session = await requireAuth()

  if (!session.user.isTenant) {
    redirect('/profile/complete?required=tenant')
  }

  return session
}

/**
 * Vérifie que l'utilisateur est un admin
 * Si pas admin → Redirect vers /
 */
export async function requireAdmin(): Promise<UserSession> {
  const session = await requireAuth()

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return session
}

/**
 * Vérifie que le profil est complet
 * Si pas complet → Redirect vers /profile/complete
 */
export async function requireProfileComplete(): Promise<UserSession> {
  const session = await requireAuth()

  if (!session.user.isOwner && !session.user.isTenant) {
    redirect('/profile/complete')
  }

  return session
}