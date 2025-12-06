import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AffiliateCard from '@/components/affiliates/AffiliateCard'
import ServiceStatusSection from '@/components/affiliates/ServiceStatusSection'
import { AffiliatePartner } from '@prisma/client'

export default async function TenantServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Récupérer les partenaires actifs
  const partners = await prisma.affiliatePartner.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { priority: 'desc' }, { name: 'asc' }],
  })

  const insurancePartners = partners.filter(
    (p: AffiliatePartner) => p.category === 'INSURANCE'
  )
  const energyPartners = partners.filter(
    (p: AffiliatePartner) => p.category === 'ENERGY'
  )
  const internetPartners = partners.filter(
    (p: AffiliatePartner) => p.category === 'INTERNET'
  )
  const movingPartners = partners.filter(
    (p: AffiliatePartner) => p.category === 'MOVING'
  )

  // Récupérer le bail actif avec statut services
  const activeLease = await prisma.lease.findFirst({
    where: {
      tenantId: user.id,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      hasInsurance: true,
      hasEnergy: true,
      hasInternet: true,
      insuranceConfirmedAt: true,
      energyConfirmedAt: true,
      internetConfirmedAt: true,
      property: {
        select: { title: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tenant"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour au dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏠 Services pour votre logement
          </h1>
          <p className="text-gray-600 text-lg">
            Découvrez nos partenaires sélectionnés pour faciliter votre
            emménagement
          </p>
        </div>

        {/* Section Statut Services (si bail actif) */}
        {activeLease && (
          <ServiceStatusSection
            propertyTitle={activeLease.property.title}
            initialServices={{
              insurance: {
                confirmed: activeLease.hasInsurance,
                confirmedAt:
                  activeLease.insuranceConfirmedAt?.toISOString() || null,
              },
              energy: {
                confirmed: activeLease.hasEnergy,
                confirmedAt:
                  activeLease.energyConfirmedAt?.toISOString() || null,
              },
              internet: {
                confirmed: activeLease.hasInternet,
                confirmedAt:
                  activeLease.internetConfirmedAt?.toISOString() || null,
              },
            }}
          />
        )}

        {/* Alerte bail actif (si pas de bail) */}
        {!activeLease && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">ℹ️</span>
              <div>
                <h2 className="font-bold text-blue-900 mb-1">
                  Vous n&apos;avez pas de bail actif
                </h2>
                <p className="text-blue-700">
                  Une fois votre bail signé, vous pourrez confirmer ici vos
                  souscriptions aux services essentiels.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Assurance */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assurance habitation
              </h2>
              <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                OBLIGATOIRE
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 text-sm">
              <span className="font-semibold">📋 Rappel légal :</span> En
              France, tout locataire doit obligatoirement souscrire une
              assurance habitation couvrant au minimum les risques locatifs.
            </p>
          </div>

          {insurancePartners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insurancePartners.map((partner: AffiliatePartner) => (
                <AffiliateCard
                  key={partner.id}
                  partner={partner}
                  source="SERVICES_PAGE"
                  leaseId={activeLease?.id}
                />
              ))}
            </div>
          ) : (
            <EmptyPartnerCard
              message="Partenaires assurance bientôt disponibles"
              icon="🛡️"
            />
          )}
        </section>

        {/* Section Énergie */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Électricité & Gaz
              </h2>
              <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                RECOMMANDÉ
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            Ouvrez votre compteur et choisissez un fournisseur d&apos;énergie
            adapté à vos besoins.
          </p>

          {energyPartners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {energyPartners.map((partner: AffiliatePartner) => (
                <AffiliateCard
                  key={partner.id}
                  partner={partner}
                  source="SERVICES_PAGE"
                  leaseId={activeLease?.id}
                />
              ))}
            </div>
          ) : (
            <EmptyPartnerCard
              message="Partenaires énergie bientôt disponibles"
              icon="⚡"
            />
          )}
        </section>

        {/* Section Internet */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🌐</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Internet & Téléphonie
              </h2>
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                RECOMMANDÉ
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            Restez connecté avec une box internet adaptée à votre logement.
          </p>

          {internetPartners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {internetPartners.map((partner: AffiliatePartner) => (
                <AffiliateCard
                  key={partner.id}
                  partner={partner}
                  source="SERVICES_PAGE"
                  leaseId={activeLease?.id}
                />
              ))}
            </div>
          ) : (
            <EmptyPartnerCard
              message="Partenaires internet bientôt disponibles"
              icon="🌐"
            />
          )}
        </section>

        {/* Section Déménagement */}
        {movingPartners.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Déménagement
                </h2>
                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  OPTIONNEL
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movingPartners.map((partner: AffiliatePartner) => (
                <AffiliateCard
                  key={partner.id}
                  partner={partner}
                  source="SERVICES_PAGE"
                  leaseId={activeLease?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <span className="font-semibold">ℹ️ Information :</span> Les liens
            vers nos partenaires sont des liens affiliés. Cela signifie que nous
            pouvons recevoir une commission si vous souscrivez à leurs services.
            Cela n&apos;affecte pas le prix que vous payez et nous aide à
            maintenir notre plateforme gratuite pour les locataires.
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyPartnerCard({
  message,
  icon,
}: {
  message: string
  icon: string
}) {
  return (
    <div className="col-span-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
      <span className="text-4xl block mb-3">{icon}</span>
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-1">Revenez bientôt !</p>
    </div>
  )
}
