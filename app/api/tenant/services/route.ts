import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer le statut des services du locataire
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le bail actif avec le statut des services
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId: user.id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        hasInsurance: true,
        hasEnergy: true,
        hasInternet: true,
        insuranceConfirmedAt: true,
        energyConfirmedAt: true,
        internetConfirmedAt: true,
        property: {
          select: { title: true },
        },
      },
    })

    if (!activeLease) {
      return NextResponse.json({
        hasActiveLease: false,
        services: null,
      })
    }

    return NextResponse.json({
      hasActiveLease: true,
      leaseId: activeLease.id,
      propertyTitle: activeLease.property.title,
      services: {
        insurance: {
          confirmed: activeLease.hasInsurance,
          confirmedAt: activeLease.insuranceConfirmedAt,
        },
        energy: {
          confirmed: activeLease.hasEnergy,
          confirmedAt: activeLease.energyConfirmedAt,
        },
        internet: {
          confirmed: activeLease.hasInternet,
          confirmedAt: activeLease.internetConfirmedAt,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching services status:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour le statut d'un service
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { service, confirmed } = body

    if (!service || typeof confirmed !== 'boolean') {
      return NextResponse.json(
        { error: 'service et confirmed requis' },
        { status: 400 }
      )
    }

    const validServices = ['insurance', 'energy', 'internet']
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { error: 'Service invalide. Valeurs acceptées: insurance, energy, internet' },
        { status: 400 }
      )
    }

    // Trouver le bail actif
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId: user.id,
        status: 'ACTIVE',
      },
    })

    if (!activeLease) {
      return NextResponse.json(
        { error: 'Aucun bail actif trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, boolean | Date | null> = {}

    if (service === 'insurance') {
      updateData.hasInsurance = confirmed
      updateData.insuranceConfirmedAt = confirmed ? new Date() : null
    } else if (service === 'energy') {
      updateData.hasEnergy = confirmed
      updateData.energyConfirmedAt = confirmed ? new Date() : null
    } else if (service === 'internet') {
      updateData.hasInternet = confirmed
      updateData.internetConfirmedAt = confirmed ? new Date() : null
    }

    // Mettre à jour le bail
    const updatedLease = await prisma.lease.update({
      where: { id: activeLease.id },
      data: updateData,
      select: {
        hasInsurance: true,
        hasEnergy: true,
        hasInternet: true,
        insuranceConfirmedAt: true,
        energyConfirmedAt: true,
        internetConfirmedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      services: {
        insurance: {
          confirmed: updatedLease.hasInsurance,
          confirmedAt: updatedLease.insuranceConfirmedAt,
        },
        energy: {
          confirmed: updatedLease.hasEnergy,
          confirmedAt: updatedLease.energyConfirmedAt,
        },
        internet: {
          confirmed: updatedLease.hasInternet,
          confirmedAt: updatedLease.internetConfirmedAt,
        },
      },
    })
  } catch (error) {
    console.error('Error updating service status:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}