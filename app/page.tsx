import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span className="text-xl font-bold text-gray-900">Renty</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Fonctionnalités
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Comment ça marche
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tarifs
              </a>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Mon espace
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium mb-6">
                <span>✨</span>
                <span>La gestion locative nouvelle génération</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Louez en toute
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {' '}
                  confiance
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Candidatures, baux, quittances, messagerie, avis et services partenaires.
                Tout ce dont propriétaires et locataires ont besoin, en un seul endroit.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 text-center"
                >
                  Commencer gratuitement
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
                >
                  Découvrir →
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-500">Gratuit locataires</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">🔒</p>
                  <p className="text-sm text-gray-500">Données sécurisées</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">⭐</p>
                  <p className="text-sm text-gray-500">Avis double-blind</p>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-1">
                <div className="space-y-4">
                  {/* Dashboard preview */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        🏠
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Appartement Paris 11
                        </p>
                        <p className="text-sm text-gray-500">2 pièces • 45m²</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                      Loué
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        💬
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Nouveau message
                        </p>
                        <p className="text-sm text-gray-500">Marie D. - Il y a 5 min</p>
                      </div>
                    </div>
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        📄
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Quittance Novembre
                        </p>
                        <p className="text-sm text-gray-500">Prête à télécharger</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                      Confirmée
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour gérer vos locations du début à la fin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Candidatures simplifiées
              </h3>
              <p className="text-gray-600">
                Recevez et gérez les candidatures en un clic. Profils vérifiés,
                documents partagés et dossiers complets.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Baux & états des lieux
              </h3>
              <p className="text-gray-600">
                Créez vos baux, gérez les colocataires et réalisez les états des
                lieux entrée/sortie avec photos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🧾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Quittances automatiques
              </h3>
              <p className="text-gray-600">
                Générez et envoyez vos quittances de loyer automatiquement.
                Suivi des paiements en temps réel.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Messagerie intégrée
              </h3>
              <p className="text-gray-600">
                Échangez directement avec vos locataires ou propriétaires.
                Historique complet et notifications.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Avis double-blind
              </h3>
              <p className="text-gray-600">
                Système d&apos;avis équitable. Les avis restent cachés tant que
                les deux parties n&apos;ont pas évalué.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gamification & badges
              </h3>
              <p className="text-gray-600">
                Gagnez de l&apos;XP, débloquez des badges et construisez votre
                réputation pour des locations en confiance.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gestion documentaire
              </h3>
              <p className="text-gray-600">
                Centralisez tous vos documents : pièces d&apos;identité, bulletins de
                salaire, contrats, attestations d&apos;assurance.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Services partenaires
              </h3>
              <p className="text-gray-600">
                Accédez à nos partenaires : assurance habitation, électricité,
                gaz, internet et déménagement.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Partage facile
              </h3>
              <p className="text-gray-600">
                Partagez votre profil ou vos annonces via un lien court.
                Contrôlez ce que vous rendez public.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En quelques étapes simples, gérez vos locations sereinement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Pour les propriétaires */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏠</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Pour les propriétaires
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Ajoutez vos biens
                    </h4>
                    <p className="text-gray-600">
                      Créez vos fiches avec photos, caractéristiques et loyer.
                      Appartements, maisons, studios, parkings...
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Recevez des candidatures
                    </h4>
                    <p className="text-gray-600">
                      Consultez les profils vérifiés, les documents et échangez
                      via la messagerie intégrée.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Gérez vos locations
                    </h4>
                    <p className="text-gray-600">
                      Créez le bail, réalisez l&apos;état des lieux, suivez les
                      paiements et générez les quittances.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pour les locataires */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔑</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Pour les locataires
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Créez votre passport
                    </h4>
                    <p className="text-gray-600">
                      Complétez votre profil avec vos infos professionnelles et
                      uploadez vos documents une seule fois.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Postulez en un clic
                    </h4>
                    <p className="text-gray-600">
                      Envoyez votre candidature avec vos documents. Suivez
                      l&apos;avancement en temps réel.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Gérez votre location
                    </h4>
                    <p className="text-gray-600">
                      Déclarez vos paiements, téléchargez vos quittances et
                      accédez aux services partenaires.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services partenaires */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Services pour votre logement
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simplifiez votre emménagement avec nos partenaires de confiance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Assurance</h3>
              <p className="text-sm text-gray-500">Habitation obligatoire</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Électricité</h3>
              <p className="text-sm text-gray-500">Meilleurs tarifs</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔥</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Gaz</h3>
              <p className="text-sm text-gray-500">Comparateur gratuit</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📶</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Internet</h3>
              <p className="text-sm text-gray-500">Box & mobile</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gratuit pour les locataires, abordable pour les propriétaires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Locataire */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔑</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Locataire
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    Gratuit
                  </span>
                </div>
                <p className="text-gray-500 mt-2">Pour toujours</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Candidatures illimitées
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Passport de confiance
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Messagerie intégrée
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Suivi des paiements
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Quittances PDF
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Services partenaires
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Commencer
              </Link>
            </div>

            {/* Propriétaire */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
                Populaire
              </div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏠</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Propriétaire
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    Gratuit
                  </span>
                </div>
                <p className="text-gray-500 mt-2">Jusqu&apos;à 4 biens</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Gestion de 4 biens
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Candidatures & baux
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> États des lieux
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Quittances auto
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Messagerie
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Avis & réputation
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Commencer
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    9,90€
                  </span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <p className="text-gray-500 mt-2">5 biens et plus</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Biens illimités
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Toutes les features
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Colocations
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Export comptable
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Support prioritaire
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-emerald-500">✓</span> Analytics avancés
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification teaser */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
            <span>🏆</span>
            <span>Système de réputation unique</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Construisez votre réputation
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Gagnez des badges, montez en niveau et démarquez-vous.
            Un profil complet et des avis positifs augmentent vos chances.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
              <span>🌟</span>
              <span className="text-gray-700 font-medium">Locataire exemplaire</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
              <span>✅</span>
              <span className="text-gray-700 font-medium">Profil vérifié</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
              <span>💬</span>
              <span className="text-gray-700 font-medium">Super communicant</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
              <span>🏠</span>
              <span className="text-gray-700 font-medium">Propriétaire fiable</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
              <span>⚡</span>
              <span className="text-gray-700 font-medium">Paiement rapide</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Prêt à simplifier votre gestion locative ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez Renty et gérez vos locations en toute sérénité.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏠</span>
                <span className="text-xl font-bold">Renty</span>
              </div>
              <p className="text-gray-400">
                La gestion locative moderne et simplifiée.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mentions légales
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    CGU
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Confidentialité
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="mailto:contact@renty.fr"
                    className="hover:text-white transition-colors"
                  >
                    contact@renty.fr
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>© 2025 Renty. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}