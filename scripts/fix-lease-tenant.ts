import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const leaseId = 'cmilp75xl000cntqcuaogn4nl'
  
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { tenants: true },
  })
  
  if (!lease) {
    console.log('❌ Bail introuvable')
    return
  }
  
  console.log('📋 Bail:', lease.id)
  console.log('👤 Tenant principal:', lease.tenantId)
  console.log('👥 Colocataires actuels:', lease.tenants.length)
  
  const primaryExists = lease.tenants.some(t => t.tenantId === lease.tenantId)
  
  if (!primaryExists) {
    console.log('\n🔧 Ajout du tenant principal...')
    
    await prisma.leaseTenant.create({
      data: {
        leaseId: lease.id,
        tenantId: lease.tenantId,
        isPrimary: true,
        share: 50,
        joinedAt: lease.startDate,
      },
    })
    console.log('✅ Ajouté !')
  }
  
  // Mettre à jour les parts à 50%
  await prisma.leaseTenant.updateMany({
    where: { leaseId: lease.id },
    data: { share: 50 },
  })
  
  console.log('✅ Parts mises à jour à 50% chacun')
  
  const updated = await prisma.leaseTenant.findMany({
    where: { leaseId: lease.id },
    include: { tenant: { select: { firstName: true, lastName: true } } },
  })
  
  console.log('\n📊 Résultat:')
  updated.forEach(t => {
    console.log(`  ${t.isPrimary ? '⭐' : '👤'} ${t.tenant.firstName} ${t.tenant.lastName}: ${t.share}%`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())