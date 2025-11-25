import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastName, gender, birthDate, phone, address } = body

    // Validation basique
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: 'Prénom et nom requis' },
        { status: 400 }
      )
    }

    // Mise à jour du profil
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        profileComplete: true, // Marquer le profil comme complet
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileComplete: true,
      },
    })

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      data: updatedUser,
    })
  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}