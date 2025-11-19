import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      isOwner: boolean
      isTenant: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isOwner: boolean
    isTenant: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isOwner: boolean
    isTenant: boolean
    firstName: string
    lastName: string
  }
}