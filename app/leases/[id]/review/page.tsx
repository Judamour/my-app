import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ReviewForm from '@/components/reviews/ReviewForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeaseReviewPage({ params }: PageProps) {
  const session = await requireAuth()
  const { id } = await params

  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true,
          title: true,
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
    notFound()
  }

  // Vérifier que l'utilisateur fait partie du bail
  const isOwner = session.user.id === lease.property.ownerId
  const isTenant = session.user.id === lease.tenant.id

  if (!isOwner && !isTenant) {
    redirect('/')
  }

  // Vérifier que le bail est terminé
  if (lease.status !== 'ENDED') {
    redirect(`/${isOwner ? 'owner' : 'tenant'}/leases/${id}`)
  }

  // Vérifier si l'utilisateur a déjà laissé un avis
  const existingReview = await prisma.review.findUnique({
    where: {
      leaseId_authorId: {
        leaseId: id,
        authorId: session.user.id,
      },
    },
  })

  if (existingReview) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Avis déjà soumis
          </h1>
          <p className="text-gray-600 mb-8">
            {existingReview.status === 'REVEALED'
              ? "Votre avis a été révélé. Vous pouvez le consulter sur le profil de l'autre partie."
              : "Votre avis sera révélé une fois que l'autre partie aura également évalué."}
          </p>
          
             <a href={`/${isOwner ? 'owner' : 'tenant'}/leases/${id}`}
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Retour au bail
          </a>
        </div>
      </div>
    )
  }

  const targetUser = isOwner ? lease.tenant : {
    id: lease.property.ownerId,
    firstName: 'Propriétaire',
    lastName: '',
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-8">
          
          <a  href={`/${isOwner ? 'owner' : 'tenant'}/leases/${id}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </a>
          <h1 className="text-3xl font-semibold text-gray-900">
            Laisser un avis
          </h1>
          <p className="text-gray-500 mt-2">
            Évaluez {targetUser.firstName} {targetUser.lastName}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Info double-blind */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Avis double-blind équitable
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Votre avis restera caché jusqu&apos;à ce que l&apos;autre partie évalue également</li>
                <li>• Les deux avis seront révélés en même temps</li>
                <li>• Révélation automatique après 14 jours si une partie n&apos;évalue pas</li>
              </ul>
            </div>
          </div>
        </div>

        <ReviewForm
          leaseId={id}
          targetName={`${targetUser.firstName} ${targetUser.lastName}`}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}