import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const {
      gender,
      birthDate,
      phone,
      address,
      isOwner,
      isTenant,
      profileComplete,
    } = body
    // Validation : au moins un rôle doit être true
    if (profileComplete && !isOwner && !isTenant) {
      return NextResponse.json(
        {
          error:
            'Vous devez sélectionner au moins un rôle (propriétaire ou locataire)',
        },
        { status: 400 }
      )
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone: phone || null,
        address: address || null,
        isOwner: isOwner || false,
        isTenant: isTenant || false,
        profileComplete: profileComplete || false,
      },
    })

    // Ne pas retourner le password
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(
      {
        message: 'Profil mis à jour avec succès',
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}
