import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Vérifie que l'utilisateur est connecté
 * Si non connecté → Redirect vers /login
 */
export async function requireAuth() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return session
}

/**
 * Vérifie que l'utilisateur est un propriétaire
 * Si pas propriétaire → Redirect vers /profile/complete
 */
export async function requireOwner() {
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
export async function requireTenant() {
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
export async function requireAdmin() {
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
export async function requireProfileComplete() {
  const session = await requireAuth()

  // On vérifie qu'il est au moins owner OU tenant
  if (!session.user.isOwner && !session.user.isTenant) {
    redirect('/profile/complete')
  }

  return session
}
