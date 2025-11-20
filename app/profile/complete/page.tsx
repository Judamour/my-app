import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CompleteProfileForm from './CompleteProfileForm'

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const params = await searchParams

  return <CompleteProfileForm session={session} required={params.required} />
}
