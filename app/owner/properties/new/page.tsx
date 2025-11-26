import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { checkSubscriptionStatus } from '@/lib/subscription'
import { PRICING_PLANS } from '@/lib/pricing'
import NewPropertyForm from '@/components/properties/NewPropertyForm'

export default async function NewPropertyPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Vérifier le statut d'abonnement
  const subscriptionStatus = await checkSubscriptionStatus(session.user.id)

  // Si limite atteinte, rediriger vers pricing
  if (!subscriptionStatus.canAddProperty) {
    redirect('/pricing?reason=limit-reached')
  }

  const isNearLimit =
    subscriptionStatus.currentCount >= subscriptionStatus.maxProperties - 1
  const planConfig = PRICING_PLANS[subscriptionStatus.plan]

  return (
    <NewPropertyForm
      isNearLimit={isNearLimit}
      currentCount={subscriptionStatus.currentCount}
      maxProperties={subscriptionStatus.maxProperties}
      planName={planConfig.name}
    />
  )
}