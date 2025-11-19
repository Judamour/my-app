import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email as string
            }
          })

          if (!user) {
            return null
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
            isTenant: user.isTenant
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
        token.isOwner = user.isOwner as boolean
        token.isTenant = user.isTenant as boolean
        token.firstName = user.firstName as string
        token.lastName = user.lastName as string
      }
      
      if (trigger === "update" && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            isOwner: true,
            isTenant: true,
            role: true,
            firstName: true,
            lastName: true
          }
        })
        
        if (freshUser) {
          token.isOwner = freshUser.isOwner
          token.isTenant = freshUser.isTenant
          token.role = freshUser.role
          token.firstName = freshUser.firstName
          token.lastName = freshUser.lastName
        }
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
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
})
