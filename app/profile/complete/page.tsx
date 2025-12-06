import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CompleteProfileForm from './CompleteProfileForm'

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, firstName: true, lastName: true },
  })

  if (!dbUser) {
    redirect('/login')
  }

  const params = await searchParams

  return <CompleteProfileForm session={{ user: dbUser }} required={params.required} />
}
