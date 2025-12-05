import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { sendVerificationEmail } from '@/lib/email/send-email'
import crypto from 'crypto'

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

    // Générer un token de vérification unique
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerified: null, // Pas encore vérifié
        role: 'USER',
        isOwner: false,
        isTenant: false,
        profileComplete: false,
      },
    })

    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(user.email, verificationToken, user.firstName)
      console.log('✅ Verification email sent to:', user.email)
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError)
      // Ne pas bloquer l'inscription si l'email échoue
    }

    // Ne pas retourner le password ni le token
    const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user

    return NextResponse.json(
      { 
        ...userWithoutSensitiveData,
        message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}