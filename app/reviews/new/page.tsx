import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ 
    type?: string
    targetId?: string
    leaseId?: string 
  }>
}

export default async function ReviewRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { leaseId } = params

  // Rediriger vers la vraie page de review
  if (leaseId) {
    redirect(`/leases/${leaseId}/review`)
  }

  // Si pas de leaseId, retour à l'accueil
  redirect('/')
}