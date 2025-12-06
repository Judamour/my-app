import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// POST - Enregistrer un clic affilié
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()
    
    const { partnerId, source, leaseId } = body

    if (!partnerId || !source) {
      return NextResponse.json(
        { error: 'partnerId et source requis' },
        { status: 400 }
      )
    }

    // Vérifier que le partenaire existe
    const partner = await prisma.affiliatePartner.findUnique({
      where: { id: partnerId },
      select: { id: true, url: true, name: true },
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partenaire non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les infos de tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Créer le clic
    await prisma.affiliateClick.create({
      data: {
        partnerId,
        userId: user?.id || null,
        source,
        leaseId: leaseId || null,
        ipAddress,
        userAgent,
      },
    })

    // Incrémenter le compteur du partenaire
    await prisma.affiliatePartner.update({
      where: { id: partnerId },
      data: { clickCount: { increment: 1 } },
    })

    return NextResponse.json({ 
      success: true, 
      redirectUrl: partner.url,
      partnerName: partner.name,
    })
  } catch (error) {
    console.error('Error tracking affiliate click:', error)
    return NextResponse.json(
      { error: 'Erreur lors du tracking' },
      { status: 500 }
    )
  }
}

// GET - Stats des clics (admin uniquement)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (dbUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const stats = await prisma.affiliatePartner.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        clickCount: true,
        _count: {
          select: {
            clicks: true,
          },
        },
      },
      orderBy: { clickCount: 'desc' },
    })

    // Stats par source
    const clicksBySource = await prisma.affiliateClick.groupBy({
      by: ['source'],
      _count: { id: true },
    })

    // Stats par jour (7 derniers jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentClicks = await prisma.affiliateClick.count({
      where: {
        clickedAt: { gte: sevenDaysAgo },
      },
    })

    return NextResponse.json({
      partners: stats,
      clicksBySource,
      recentClicks,
    })
  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stats' },
      { status: 500 }
    )
  }
}