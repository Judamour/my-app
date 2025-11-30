import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DocumentUploadSection from '@/components/documents/DocumentUploadSection'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenantLeaseDocumentsPage({ params }: PageProps) {
  const session = await requireAuth()
  const { id } = await params

  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          ownerId: true,
        },
      },
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      tenants: {
        where: { leftAt: null },
        select: { tenantId: true },
      },
    },
  })

  if (!lease) {
    redirect('/tenant/leases')
  }

  // Vérifier autorisation (tenant principal ou colocataire)
  const isMainTenant = lease.tenantId === session.user.id
  const isCoTenant = lease.tenants.some(t => t.tenantId === session.user.id)

  if (!isMainTenant && !isCoTenant) {
    redirect('/tenant/leases')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/tenant/leases/${id}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au bail
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            📄 Documents du bail
          </h1>
          <p className="text-gray-600 mt-2">
            {lease.property.title}
          </p>
        </div>

        {/* Content */}
        <DocumentUploadSection leaseId={id} />
      </div>
    </div>
  )
}