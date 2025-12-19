"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageSliderProps {
  images: string[]
  coverIndex: number
  alt: string
}

export function ImageSlider({ images, coverIndex, alt }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(coverIndex)

  // Ensure coverIndex is valid
  useEffect(() => {
    if (coverIndex >= 0 && coverIndex < images.length) {
      setCurrentIndex(coverIndex)
    } else {
      setCurrentIndex(0)
    }
  }, [coverIndex, images.length])

  // If only one image, just show it
  if (images.length <= 1) {
    return (
      <div className="relative w-full aspect-[4/3] bg-black">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={images[0] || '/images/chef01.jpg'}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  return (
    <div className="relative w-full aspect-[4/3] bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-80 hover:opacity-100"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-80 hover:opacity-100"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Image Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

