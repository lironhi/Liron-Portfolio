'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageItem {
  src: string;
  alt: string;
  label: string;
}

interface ProjectImageGalleryProps {
  projectSlug: string;
}

interface ImageItemWithOrientation extends ImageItem {
  orientation?: 'portrait' | 'landscape';
}

const imagesByProject: Record<string, ImageItemWithOrientation[]> = {
  'eliana-beauty': [
    { src: '/projects/eliana-beauty/main.png', alt: 'Landing Page', label: 'Landing Page', orientation: 'landscape' },
    { src: '/projects/eliana-beauty/services.png', alt: 'Services', label: 'Services Catalog', orientation: 'landscape' },
    { src: '/projects/eliana-beauty/booking.png', alt: 'Booking', label: 'Booking System', orientation: 'landscape' },
    { src: '/projects/eliana-beauty/dashboard.png', alt: 'Dashboard', label: 'Admin Dashboard', orientation: 'landscape' },
    { src: '/projects/eliana-beauty/appointment.png', alt: 'Appointments', label: 'Appointments', orientation: 'landscape' },
    { src: '/projects/eliana-beauty/profil.png', alt: 'Profile', label: 'Client Profile', orientation: 'landscape' },
    { src: '/projects/eliana-beauty/msg.png', alt: 'Messages', label: 'Messaging', orientation: 'landscape' },
    { src: '/projects/eliana-beauty/main_mob.png', alt: 'Mobile', label: 'Mobile View', orientation: 'portrait' },
  ],
};

export function ProjectImageGallery({ projectSlug }: ProjectImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const images = imagesByProject[projectSlug] || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className="not-prose my-12">
        <div className="relative rounded-xl overflow-hidden border bg-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5 bg-border p-0.5">
            {images.map((image, index) => {
              const isPortrait = image.orientation === 'portrait';
              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-background cursor-pointer ${
                    isPortrait ? 'aspect-[9/16]' : 'aspect-video'
                  }`}
                  onClick={() => openModal(index)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                      {image.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal/Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-7xl max-h-[85vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              className="w-full h-full object-contain rounded-lg"
            />

            {/* Image Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg">
              <p className="text-white text-lg font-medium">
                {images[selectedIndex].label}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {selectedIndex + 1} / {images.length}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-all ${
                    index === selectedIndex
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
