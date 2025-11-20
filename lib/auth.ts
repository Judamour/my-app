import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        console.log('1️⃣ Credentials reçues:', credentials)

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credentials manquantes')
          return null
        }

        try {
          console.log('2️⃣ Recherche user:', credentials.email)

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          })

          console.log('3️⃣ User trouvé ?', user ? 'OUI' : 'NON')

          if (!user) {
            console.log('❌ User inexistant')
            return null
          }

          console.log('4️⃣ Vérification password...')

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          console.log('5️⃣ Password valide ?', isPasswordValid ? 'OUI' : 'NON')

          if (!isPasswordValid) {
            console.log('❌ Password incorrect')
            return null
          }

          console.log('✅ Authentification réussie pour:', user.email)

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as string,
            isOwner: user.isOwner,
            isTenant: user.isTenant,
          }
        } catch (error) {
          console.error('💥 ERREUR DANS AUTHORIZE:', error)
          console.error('💥 Stack:', (error as Error).stack)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
        token.isOwner = user.isOwner as boolean
        token.isTenant = user.isTenant as boolean
        token.firstName = user.firstName as string
        token.lastName = user.lastName as string
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
    },
  },
  pages: {
    signIn: '/login',
  },
})
