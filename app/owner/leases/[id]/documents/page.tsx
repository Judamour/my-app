import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BackButton from '@/components/BackButton'
import DocumentUploadSection from '@/components/documents/DocumentUploadSection'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeaseDocumentsPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params

  if (!user) {
    redirect('/login')
  }

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
    },
  })

  if (!lease) {
    redirect('/owner/leases')
  }

  // Vérifier autorisation
  const isOwner = lease.property.ownerId === user.id
  const isTenant = lease.tenantId === user.id

  if (!isOwner && !isTenant) {
    redirect('/owner')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            📄 Documents du bail
          </h1>
          <p className="text-gray-600 mt-2">
            {lease.property.title} - {lease.tenant.firstName}{' '}
            {lease.tenant.lastName}
          </p>
        </div>

        {/* Content */}
        <DocumentUploadSection leaseId={id} />
      </div>
    </div>
  )
}
