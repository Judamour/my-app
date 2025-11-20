'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  title: string
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="w-full mb-6">
      {/* Image principale */}
      <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden group">
        <Image
          src={images[currentIndex]}
          alt={`${title} - Photo ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          priority={currentIndex === 0}
        />

        {/* Flèches de navigation */}
        {images.length > 1 && (
          <>
            {/* Flèche gauche */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Image précédente"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Flèche droite */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Image suivante"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Compteur */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((url, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={url}
                alt={`Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
