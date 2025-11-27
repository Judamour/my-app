import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { sendEmail } from '@/lib/email/send-email'
import WelcomeEmail from '@/emails/templates/WelcomeEmail'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    // Validation des champs obligatoires
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur avec le nouveau format
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'USER', // Par défaut USER
        isOwner: false, // Par défaut false
        isTenant: false, // Par défaut false
        profileComplete: false, // Profil pas encore complété
      },
    })

    // ✅ NOUVEAU : Envoyer l'email de bienvenue
    try {
      await sendEmail({
        to: user.email,
        subject: '🏠 Bienvenue sur RentEasy !',
        react: WelcomeEmail({
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        }),
      })
      console.log('✅ Welcome email sent to:', user.email)
    } catch (emailError) {
      // Ne pas bloquer l'inscription si l'email échoue
      console.error('⚠️ Email sending failed:', emailError)
    }

    // Ne pas retourner le password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}