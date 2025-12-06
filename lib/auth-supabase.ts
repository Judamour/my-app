import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Type pour la session utilisateur
export interface UserSession {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isOwner: boolean
  isTenant: boolean
  emailVerified: boolean
}

// Récupère la session Supabase + données utilisateur Prisma
export async function getSession(): Promise<UserSession | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer les données utilisateur depuis Prisma
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
      emailVerified: true,
    },
  })

  if (!dbUser) return null

  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName || '',
    lastName: dbUser.lastName || '',
    role: dbUser.role,
    isOwner: dbUser.isOwner,
    isTenant: dbUser.isTenant,
    emailVerified: !!dbUser.emailVerified,
  }
}

// Vérifie l'authentification et redirige si non connecté
export async function requireAuth(): Promise<UserSession> {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

// Vérifie que l'utilisateur est propriétaire
export async function requireOwner(): Promise<UserSession> {
  const session = await requireAuth()

  if (!session.isOwner) {
    redirect('/profile/complete')
  }

  return session
}

// Vérifie que l'utilisateur est locataire
export async function requireTenant(): Promise<UserSession> {
  const session = await requireAuth()

  if (!session.isTenant) {
    redirect('/profile/complete')
  }

  return session
}

// Vérifie que l'utilisateur est admin
export async function requireAdmin(): Promise<UserSession> {
  const session = await requireAuth()

  if (session.role !== 'ADMIN') {
    redirect('/')
  }

  return session
}

// Vérifie que le profil est complet (a un rôle)
export async function requireProfileComplete(): Promise<UserSession> {
  const session = await requireAuth()

  if (!session.isOwner && !session.isTenant) {
    redirect('/profile/complete')
  }

  return session
}

// Fonction pour les API routes (retourne null au lieu de redirect)
export async function getSessionForAPI(): Promise<UserSession | null> {
  return getSession()
}

// Synchronise un utilisateur Supabase avec Prisma (après OAuth)
export async function syncUserWithPrisma(
  supabaseUserId: string,
  email: string,
  firstName?: string,
  lastName?: string
) {
  // Vérifier si l'utilisateur existe déjà
  let user = await prisma.user.findUnique({
    where: { id: supabaseUserId },
  })

  if (!user) {
    // Créer l'utilisateur dans Prisma
    user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        emailVerified: new Date(), // OAuth = email vérifié
      },
    })
  }

  return user
}
