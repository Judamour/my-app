import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params
    const { type } = await request.json()

    if (!type || !['in', 'out'].includes(type)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
    }

    // Vérifier le bail
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        property: { select: { ownerId: true } },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    // Seul le propriétaire peut confirmer l'état des lieux
    if (lease.property.ownerId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Vérifier le statut selon le type
    if (type === 'in' && lease.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: "Le bail doit être en attente pour l'état des lieux d'entrée",
        },
        { status: 400 }
      )
    }

    if (type === 'out' && lease.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "Le bail doit être actif pour l'état des lieux de sortie" },
        { status: 400 }
      )
    }

    // Mettre à jour selon le type
    const updateData =
      type === 'in'
        ? {
            inventoryInDone: true,
            inventoryInAt: new Date(),
            inventoryInBy: user.id,
          }
        : {
            inventoryOutDone: true,
            inventoryOutAt: new Date(),
            inventoryOutBy: user.id,
          }

    await prisma.lease.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Inventory error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
