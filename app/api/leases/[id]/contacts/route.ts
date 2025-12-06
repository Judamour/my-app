import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour un contact
const contactSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  phone: z.string().min(1, 'Téléphone requis'),
  role: z.string().min(1, 'Rôle requis'),
  notes: z.string().optional(),
})

const contactsSchema = z.array(contactSchema)

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Récupérer les contacts utiles d'un bail
export async function GET(request: Request, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  const lease = await prisma.lease.findUnique({
    where: { id },
    select: {
      usefulContacts: true,
      property: {
        select: { ownerId: true },
      },
      tenantId: true,
      tenants: {
        select: { tenantId: true },
      },
    },
  })

  if (!lease) {
    return NextResponse.json({ error: 'Bail non trouvé' }, { status: 404 })
  }

  // Vérifier que l'utilisateur est propriétaire ou locataire du bail
  const isOwner = lease.property.ownerId === user.id
  const isTenant = lease.tenantId === user.id
  const isCoTenant = lease.tenants.some((t) => t.tenantId === user.id)

  if (!isOwner && !isTenant && !isCoTenant) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  return NextResponse.json({
    contacts: lease.usefulContacts || [],
  })
}

// PUT - Mettre à jour les contacts utiles (propriétaire uniquement)
export async function PUT(request: Request, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  const lease = await prisma.lease.findUnique({
    where: { id },
    select: {
      property: {
        select: { ownerId: true },
      },
    },
  })

  if (!lease) {
    return NextResponse.json({ error: 'Bail non trouvé' }, { status: 404 })
  }

  // Seul le propriétaire peut modifier les contacts
  if (lease.property.ownerId !== user.id) {
    return NextResponse.json(
      { error: 'Seul le propriétaire peut modifier les contacts' },
      { status: 403 }
    )
  }

  const body = await request.json()

  // Validation
  const result = contactsSchema.safeParse(body.contacts)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: result.error.flatten() },
      { status: 400 }
    )
  }

  // Mise à jour
  const updatedLease = await prisma.lease.update({
    where: { id },
    data: {
      usefulContacts: result.data,
    },
    select: {
      usefulContacts: true,
    },
  })

  return NextResponse.json({
    success: true,
    contacts: updatedLease.usefulContacts,
  })
}
