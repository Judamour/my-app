import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()

      // Échanger le code contre une session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Supabase exchangeCodeForSession error:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_exchange_error`)
      }

      if (data.user) {
        // Synchroniser l'utilisateur avec Prisma
        const user = data.user
        const metadata = user.user_metadata

        // Vérifier si l'utilisateur existe déjà dans Prisma (par ID ou email)
        let dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        })

        // Si pas trouvé par ID, chercher par email (migration depuis ancien système)
        if (!dbUser) {
          dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (dbUser) {
            // Utilisateur existe avec ancien ID -> mettre à jour l'ID (migration)
            dbUser = await prisma.user.update({
              where: { email: user.email! },
              data: {
                id: user.id,
                emailVerified: dbUser.emailVerified || new Date(),
                avatar: dbUser.avatar || metadata?.avatar_url || metadata?.picture || null,
              },
            })
          }
        }

        if (!dbUser) {
          // Créer l'utilisateur dans Prisma
          dbUser = await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              firstName: metadata?.full_name?.split(' ')[0] || metadata?.name?.split(' ')[0] || '',
              lastName: metadata?.full_name?.split(' ').slice(1).join(' ') || metadata?.name?.split(' ').slice(1).join(' ') || '',
              emailVerified: new Date(),
              avatar: metadata?.avatar_url || metadata?.picture || null,
            },
          })
        } else {
          // Mettre à jour l'email verified si pas déjà fait
          if (!dbUser.emailVerified) {
            await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            })
          }
        }

        // Rediriger vers la bonne page selon le rôle
        if (dbUser.isOwner) {
          return NextResponse.redirect(`${origin}/owner`)
        } else if (dbUser.isTenant) {
          return NextResponse.redirect(`${origin}/tenant`)
        } else {
          return NextResponse.redirect(`${origin}/profile/complete`)
        }
      }
    } catch (err) {
      console.error('Auth callback error:', err)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  // Erreur ou pas de code → rediriger vers login avec erreur
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
