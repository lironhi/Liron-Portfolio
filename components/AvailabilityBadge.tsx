'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Full sentences, not just the role: swapping only the middle word left a visible
// gap before "roles" whenever the shorter one was showing.
const LABELS = ['Open to Full-Stack roles', 'Open to AI Engineer roles'];
const INTERVAL_MS = 2000;

/**
 * "Open to work" pill. The gradient sits on a 1px wrapper so the border itself is
 * a gradient, with the real background on the inner span - a plain `border` can't
 * do that. Colours are hard-coded emerald rather than themed: this badge should
 * read as a live status signal, not as part of the page palette.
 *
 * The role cycles. Both labels are stacked in the same grid cell so the pill is
 * always as wide as the longest one and never jumps as the text swaps.
 */
export function AvailabilityBadge({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Text swapping once a second is exactly the kind of motion this query exists
    // for - hold on the first role instead.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const timer = setInterval(() => setIndex((i) => (i + 1) % LABELS.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className={cn(
        'group inline-flex rounded-full p-px',
        'bg-[linear-gradient(110deg,var(--color-emerald-400),var(--color-teal-300),var(--color-emerald-500),var(--color-teal-400),var(--color-emerald-400))]',
        'bg-size-[200%_100%] animate-gradient-x',
        'shadow-[0_0_22px_-8px_rgb(16_185_129/0.85)] transition-shadow duration-500',
        'hover:shadow-[0_0_28px_-4px_rgb(16_185_129/0.95)]',
        className
      )}
    >
      <span className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-background/95 px-3.5 py-1.5 backdrop-blur-sm">
        {/* light sweeping across the pill */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 shimmer" />

        {/* status dot: solid core, expanding halo */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16_185_129/0.9)]" />
        </span>

        {/* Both labels share one grid cell: the pill is always as wide as the
            longest, and the shorter one centres inside it rather than leaving a hole. */}
        <span
          aria-hidden="true"
          className="relative inline-grid justify-items-center whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide text-emerald-700 dark:text-emerald-300"
        >
          {LABELS.map((label, i) => (
            <span
              key={label}
              className={cn(
                'col-start-1 row-start-1 transition-opacity duration-300',
                i === index ? 'opacity-100' : 'opacity-0'
              )}
            >
              {label}
            </span>
          ))}
        </span>

        {/* Read once, steadily, instead of announcing a change every second. */}
        <span className="sr-only">Open to Full-Stack and AI Engineer roles</span>
      </span>
    </span>
  );
}
