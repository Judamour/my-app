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
      // Infos générales
      gender,
      birthDate,
      phone,
      address,
      // 🆕 Infos professionnelles
      salary,
      profession,
      companyName,
      contractType,
      currentCity,
      currentPostalCode,
      // Rôles
      isOwner,
      isTenant,
      profileComplete,
      // 🆕 Préférences confidentialité
      showBadges,
      showLevel,
      showRankBorder,
      showReviewStats,
      showPhone,
      showAddress,
    } = body

    // Validation : au moins un rôle doit être true (seulement si profileComplete est présent)
    if (profileComplete !== undefined && !isOwner && !isTenant) {
      return NextResponse.json(
        {
          error:
            'Vous devez sélectionner au moins un rôle (propriétaire ou locataire)',
        },
        { status: 400 }
      )
    }

    // Construire l'objet de mise à jour (seulement les champs fournis)
    const updateData: Record<string, any> = {}

    // Infos générales
    if (gender !== undefined) updateData.gender = gender || null
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null
    if (phone !== undefined) updateData.phone = phone || null
    if (address !== undefined) updateData.address = address || null

    // 🆕 Infos professionnelles
    if (salary !== undefined) updateData.salary = salary
    if (profession !== undefined) updateData.profession = profession || null
    if (companyName !== undefined) updateData.companyName = companyName || null
    if (contractType !== undefined) updateData.contractType = contractType || null
    if (currentCity !== undefined) updateData.currentCity = currentCity || null
    if (currentPostalCode !== undefined) updateData.currentPostalCode = currentPostalCode || null

    // Rôles
    if (isOwner !== undefined) updateData.isOwner = isOwner || false
    if (isTenant !== undefined) updateData.isTenant = isTenant || false
    if (profileComplete !== undefined) updateData.profileComplete = profileComplete || false

    // 🆕 Préférences confidentialité
    if (showBadges !== undefined) updateData.showBadges = showBadges
    if (showLevel !== undefined) updateData.showLevel = showLevel
    if (showRankBorder !== undefined) updateData.showRankBorder = showRankBorder
    if (showReviewStats !== undefined) updateData.showReviewStats = showReviewStats
    if (showPhone !== undefined) updateData.showPhone = showPhone
    if (showAddress !== undefined) updateData.showAddress = showAddress

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
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