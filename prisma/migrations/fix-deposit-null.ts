import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Mettre à jour tous les avis où depositReturned = false mais depositReturnedPercent = null
  const result = await prisma.review.updateMany({
    where: {
      depositReturned: false,
      depositReturnedPercent: null,
    },
    data: {
      depositReturnedPercent: 0,
    },
  })

  console.log(`✅ ${result.count} avis mis à jour (null → 0%)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
