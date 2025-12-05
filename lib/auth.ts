import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Email/Password
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          })

          if (!user) {
            return null
          }

          // Vérifier que l'email est vérifié
          if (!user.emailVerified) {
            throw new Error('EMAIL_NOT_VERIFIED')
          }

          // Vérifier le mot de passe (peut être null pour OAuth)
          if (!user.password) {
            throw new Error('USE_GOOGLE_LOGIN')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as string,
            isOwner: user.isOwner,
            isTenant: user.isTenant,
            emailVerified: user.emailVerified?.toISOString(),
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth Google : créer ou mettre à jour l'utilisateur
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (existingUser) {
            // Mettre à jour emailVerified si pas déjà fait
            if (!existingUser.emailVerified) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              })
            }
          } else {
            // Créer nouveau compte OAuth
            const [firstName, ...lastNameParts] = (user.name || 'User').split(' ')
            const lastName = lastNameParts.join(' ') || 'OAuth'

            await prisma.user.create({
              data: {
                email: user.email!,
                firstName,
                lastName,
                password: null, // Pas de mot de passe pour OAuth
                emailVerified: new Date(), // Auto-vérifié par Google
                isTenant: true, // Par défaut tenant
              },
            })
          }
          
          return true
        } catch (error) {
          console.error('Google OAuth error:', error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // Première connexion
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
        token.isOwner = user.isOwner as boolean
        token.isTenant = user.isTenant as boolean
        token.firstName = user.firstName as string
        token.lastName = user.lastName as string
        token.emailVerified = user.emailVerified as string
      }

      // OAuth : charger les infos depuis la DB
      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            role: true,
            isOwner: true,
            isTenant: true,
            firstName: true,
            lastName: true,
            emailVerified: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.isOwner = dbUser.isOwner
          token.isTenant = dbUser.isTenant
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
          token.emailVerified = dbUser.emailVerified?.toISOString()
        }
      }

      // Update session
      if (trigger === 'update' && session) {
        if (session.isOwner !== undefined) token.isOwner = session.isOwner
        if (session.isTenant !== undefined) token.isTenant = session.isTenant
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isOwner = token.isOwner as boolean
        session.user.isTenant = token.isTenant as boolean
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.emailVerified = token.emailVerified as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})