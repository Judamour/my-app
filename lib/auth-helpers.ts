import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOwner: true, profileComplete: true }
  })

  if (!user?.isOwner) {
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isTenant: true, profileComplete: true }
  })

  if (!user?.isTenant) {
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOwner: true, isTenant: true, profileComplete: true }
  })

  if (!user?.isOwner && !user?.isTenant) {
    redirect('/profile/complete')
  }

  return session
}