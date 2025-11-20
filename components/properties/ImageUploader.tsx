'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'


interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ 
  images, 
  onImagesChange,
  maxImages = 10 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Vérifier le nombre max d'images
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`)
      return
    }

    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erreur upload')
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      onImagesChange([...images, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} image(s) ajoutée(s)`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    toast.success('Image supprimée')
  }

  return (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Photos du bien
      <span className="text-gray-400 text-xs ml-2">
        ({images.length}/{maxImages} max)
      </span>
    </label>

    {/* Grille d'images */}
    {images.length > 0 && (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <Image
              src={url}
              alt={`Photo ${index + 1}`}
              width={400}
              height={300}
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Photo principale
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Bouton upload */}
    {images.length < maxImages && (
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-sm text-gray-600">
            {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter des photos'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG jusqu&apos;à 10MB
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
    )}

    {images.length === 0 && (
      <p className="text-sm text-gray-500 mt-2">
        💡 La première image sera la photo principale
      </p>
    )}
  </div>
)
}