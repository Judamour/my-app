import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer tous les baux existants
  const leases = await prisma.lease.findMany({
    select: {
      id: true,
      tenantId: true,
      startDate: true,
    },
  })

  console.log(`📦 ${leases.length} baux à migrer...`)

  for (const lease of leases) {
    // Vérifier si un LeaseTenant existe déjà
    const existing = await prisma.leaseTenant.findUnique({
      where: {
        leaseId_tenantId: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
        },
      },
    })

    if (!existing) {
      await prisma.leaseTenant.create({
        data: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          isPrimary: true,
          share: 100,
          joinedAt: lease.startDate,
        },
      })
      console.log(`✅ Bail ${lease.id} migré`)
    } else {
      console.log(`⏭️ Bail ${lease.id} déjà migré`)
    }
  }

  console.log('🎉 Migration terminée !')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())