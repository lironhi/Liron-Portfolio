'use client';

import { useEffect } from 'react';

/**
 * Component that adds mobile-specific optimizations
 * - Prevents zoom on double-tap for better UX
 * - Adds touch-action optimizations
 * - Improves scroll performance
 */
export function MobileOptimizations() {
  useEffect(() => {
    // Prevent double-tap zoom on mobile while keeping pinch-zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    // Add viewport meta tag optimizations dynamically if needed
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
      );
    }

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, []);

  return null; // This component doesn't render anything
}
