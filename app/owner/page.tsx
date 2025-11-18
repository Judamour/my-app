import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OwnerPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  if (session.user.role !== 'OWNER') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-600">Accès Refusé</h1>
        <p>Cette page est réservée aux propriétaires.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Bienvenue {session.user.name} ! 🎉
        </h1>
        
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button 
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Se déconnecter
          </button>
        </form>
      </div>
      
      <div className="bg-green-100 p-4 rounded mb-6">
        <p>✅ Vous êtes connecté avec succès !</p>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Vos Informations</h2>
        <p><strong>Email :</strong> {session.user.email}</p>
        <p><strong>Nom :</strong> {session.user.name}</p>
        <p><strong>Rôle :</strong> {session.user.role}</p>
        <p><strong>ID :</strong> {session.user.id}</p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">🎯 Prochaines Étapes</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Créer les pages pour gérer les propriétés</li>
          <li>Ajouter les locataires</li>
          <li>Gérer les paiements</li>
        </ul>
      </div>
    </div>
  )
}