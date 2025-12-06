import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les partenaires affiliés
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    const partners = await prisma.affiliatePartner.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { priority: 'desc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        category: true,
        headline: true,
        description: true,
        features: true,
        url: true,
        ctaText: true,
        isFeatured: true,
      },
    })

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Error fetching affiliates:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des partenaires' },
      { status: 500 }
    )
  }
}

// POST - Créer un partenaire (admin uniquement)
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, slug, logo, category, headline, description, features, url, ctaText, priority, isFeatured } = body

    if (!name || !slug || !category || !headline || !url) {
      return NextResponse.json(
        { error: 'Champs requis : name, slug, category, headline, url' },
        { status: 400 }
      )
    }

    const partner = await prisma.affiliatePartner.create({
      data: {
        name,
        slug,
        logo,
        category,
        headline,
        description,
        features: features || [],
        url,
        ctaText: ctaText || 'Découvrir',
        priority: priority || 0,
        isFeatured: isFeatured || false,
      },
    })

    return NextResponse.json({ partner }, { status: 201 })
  } catch (error) {
    console.error('Error creating affiliate:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du partenaire' },
      { status: 500 }
    )
  }
}