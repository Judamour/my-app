import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { tenantId } = await params

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const currentUserId = user.id

    // ============================================
    // CAS 1 : Le locataire consulte ses propres documents
    // ============================================
    if (currentUserId === tenantId) {
      const documents = await prisma.document.findMany({
        where: {
          ownerId: tenantId,
          leaseId: null, // Documents profil uniquement
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        documents,
        accessType: 'owner',
        canView: true,
      })
    }

    // ============================================
    // CAS 2 : Un propriétaire veut voir les documents d'un locataire
    // ============================================

    // Vérifier que le visiteur est bien propriétaire
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { isOwner: true },
    })

    if (!currentUser?.isOwner) {
      return NextResponse.json({
        documents: [],
        accessType: 'none',
        canView: false,
        message: 'Seuls les propriétaires peuvent consulter les documents des candidats',
      })
    }

    // ============================================
    // VÉRIFICATION 1 : Candidature PENDING ou ACCEPTED
    // ============================================
    const applicationAccess = await prisma.application.findFirst({
      where: {
        tenantId,
        property: { ownerId: currentUserId },
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      include: {
        sharedDocuments: {
          include: {
            document: true,
          },
        },
        property: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // ============================================
    // VÉRIFICATION 2 : Bail ACTIVE ou PENDING
    // ============================================
    const leaseAccess = await prisma.lease.findFirst({
      where: {
        tenantId,
        property: { ownerId: currentUserId },
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      include: {
        property: {
          select: {
            title: true,
          },
        },
      },
    })

    // ============================================
    // AUCUN ACCÈS
    // ============================================
    if (!applicationAccess && !leaseAccess) {
      return NextResponse.json({
        documents: [],
        accessType: 'none',
        canView: false,
        message: 'Vous n\'avez pas accès aux documents de ce locataire. Vous devez avoir une candidature en cours ou un bail actif.',
      })
    }

    // ============================================
    // ACCÈS VIA CANDIDATURE
    // ============================================
    if (applicationAccess && applicationAccess.sharedDocuments.length > 0) {
      // Mettre à jour les statistiques de consultation
      const sharedDocIds = applicationAccess.sharedDocuments.map(sd => sd.id)

      // Marquer comme vu (première fois)
      await prisma.sharedDocument.updateMany({
        where: {
          id: { in: sharedDocIds },
          viewedAt: null,
        },
        data: {
          viewedAt: new Date(),
        },
      })

      // Incrémenter le compteur de vues
      await prisma.sharedDocument.updateMany({
        where: {
          id: { in: sharedDocIds },
        },
        data: {
          viewedCount: { increment: 1 },
        },
      })

      return NextResponse.json({
        documents: applicationAccess.sharedDocuments.map(sd => sd.document),
        accessType: 'application',
        canView: true,
        applicationId: applicationAccess.id,
        applicationStatus: applicationAccess.status,
        propertyTitle: applicationAccess.property.title,
        sharedCount: applicationAccess.sharedDocuments.length,
      })
    }

    // ============================================
    // ACCÈS VIA BAIL (tous les documents profil)
    // ============================================
    if (leaseAccess) {
      const documents = await prisma.document.findMany({
        where: {
          ownerId: tenantId,
          leaseId: null, // Documents profil
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        documents,
        accessType: 'lease',
        canView: true,
        leaseId: leaseAccess.id,
        leaseStatus: leaseAccess.status,
        propertyTitle: leaseAccess.property.title,
      })
    }

    // ============================================
    // CANDIDATURE SANS DOCUMENTS PARTAGÉS
    // ============================================
    if (applicationAccess && applicationAccess.sharedDocuments.length === 0) {
      return NextResponse.json({
        documents: [],
        accessType: 'application',
        canView: true,
        applicationId: applicationAccess.id,
        applicationStatus: applicationAccess.status,
        propertyTitle: applicationAccess.property.title,
        message: 'Le candidat n\'a pas partagé de documents avec sa candidature.',
      })
    }

    // Fallback
    return NextResponse.json({
      documents: [],
      accessType: 'none',
      canView: false,
    })
  } catch (error) {
    console.error('Erreur accès documents:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
