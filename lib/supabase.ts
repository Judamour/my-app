import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

// Client public (pour le navigateur)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Client admin (pour le serveur avec service_role)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fonction helper pour upload (UTILISE ADMIN)
export async function uploadDocument(
  file: File,
  leaseId: string
): Promise<{ url: string; error?: string }> {
  try {
    // Créer un nom de fichier unique
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `leases/${leaseId}/${fileName}`

    // Upload vers Supabase Storage AVEC ADMIN CLIENT
    const { data, error } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { url: '', error: error.message }
    }

    // Obtenir l'URL publique
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('documents').getPublicUrl(data.path)

    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: '', error: 'Erreur lors de l\'upload' }
  }
}

// Fonction helper pour supprimer (UTILISE ADMIN)
export async function deleteDocument(url: string): Promise<boolean> {
  try {
    // Extraire le path du document depuis l'URL
    const urlObj = new URL(url)
    const path = urlObj.pathname.split('/storage/v1/object/public/documents/')[1]

    if (!path) {
      console.error('Invalid document URL')
      return false
    }

    const { error } = await supabaseAdmin.storage
      .from('documents')
      .remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}
