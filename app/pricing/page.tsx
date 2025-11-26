import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRICING_PLANS, type PricingPlan } from '@/lib/pricing'
import Link from 'next/link'
import PricingCard from '@/components/pricing/PricingCard'

export default async function PricingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Récupérer l'utilisateur avec son plan actuel et nombre de propriétés
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionPlan: true,
      stripeCurrentPeriodEnd: true,
      _count: {
        select: {
          ownedProperties: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  const currentPlan = user.subscriptionPlan as PricingPlan
  const propertyCount = user._count.ownedProperties
  const hasActiveSubscription = 
    user.stripeCurrentPeriodEnd && 
    user.stripeCurrentPeriodEnd > new Date()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/owner"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Retour au dashboard
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des tarifs simples et transparents pour tous les propriétaires
          </p>

          {/* Info plan actuel */}
          {currentPlan !== 'free' && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <span>Plan actuel : {PRICING_PLANS[currentPlan].name}</span>
              {hasActiveSubscription && (
                <span className="text-blue-600">
                  • Expire le {user.stripeCurrentPeriodEnd?.toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          )}

          {/* Info propriétés */}
          <div className="mt-4 text-sm text-gray-600">
            Vous avez actuellement <span className="font-semibold">{propertyCount}</span> propriété{propertyCount > 1 ? 's' : ''}
          </div>
        </div>

        {/* Grille des plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {Object.values(PRICING_PLANS).map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              propertyCount={propertyCount}
              isActive={currentPlan === plan.id}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements sont pris en compte immédiatement.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">
                Que se passe-t-il si je dépasse la limite de propriétés ?
              </h3>
              <p className="text-gray-600">
                Vous devrez upgrader vers un plan supérieur pour ajouter de nouvelles propriétés. 
                Vos propriétés existantes restent accessibles.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">
                Y a-t-il un engagement de durée ?
              </h3>
              <p className="text-gray-600">
                Non, tous nos abonnements sont sans engagement. 
                Vous pouvez annuler à tout moment depuis votre espace client.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">
                Le plan Enterprise est-il personnalisable ?
              </h3>
              <p className="text-gray-600">
                Oui, contactez-nous pour discuter de vos besoins spécifiques. 
                Nous proposons des solutions sur mesure pour les agences immobilières.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Enterprise */}
        <div className="mt-12 text-center">
          <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">
              Besoin d&apos;un plan Enterprise ?
            </h3>
            <p className="mb-6">
              Contactez-nous pour discuter de vos besoins spécifiques
            </p>
            
          <a    href="mailto:contact@votreapp.com"
              className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}