import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadDocument } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const leaseId = formData.get('leaseId') as string
    const type = formData.get('type') as string
    const name = formData.get('name') as string

    if (!file || !leaseId || !type || !name) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const validTypes = [
      // Documents bail
      'INVENTORY_IN',
      'INVENTORY_OUT',
      'CONTRACT',
      'INSURANCE',
      'RECEIPT',
      'PHOTO_ENTRY',
      'PHOTO_EXIT',
      // Documents personnels
      'ID_CARD',
      'PAYSLIP',
      'TAX_NOTICE',
      'PROOF_ADDRESS',
      'WORK_CONTRACT',
      'BANK_STATEMENT',
      'GUARANTOR_ID',
      'GUARANTOR_INCOME',
      // Compatibilité
      'INVENTORY',
      'OTHER',
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type de document invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le bail existe et appartient à l'utilisateur
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: true,
        tenant: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Bail introuvable' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est propriétaire, locataire principal, ou colocataire
    const isOwner = lease.property.ownerId === session.user.id
    const isTenant = lease.tenantId === session.user.id

    // Vérifier si colocataire
    const isCoTenant = await prisma.leaseTenant.findFirst({
      where: {
        leaseId,
        tenantId: session.user.id,
        leftAt: null,
      },
    })

    if (!isOwner && !isTenant && !isCoTenant) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Upload vers Supabase
    const { url, error: uploadError } = await uploadDocument(file, leaseId)

    if (uploadError || !url) {
      return NextResponse.json(
        { error: uploadError || 'Erreur upload' },
        { status: 500 }
      )
    }

    // Créer l'entrée dans la DB
    const document = await prisma.document.create({
      data: {
        ownerId: session.user.id,
        leaseId,
        propertyId: lease.propertyId,
        type: type as any,
        name,
        url,
        size: file.size,
      },
    })

    return NextResponse.json({ data: document })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    )
  }
}
