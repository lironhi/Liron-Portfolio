import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
}

export function formatDateRange(startDate: string, endDate?: string): string {
  const start = formatDate(startDate, { year: 'numeric', month: 'short' });

  if (!endDate) {
    return `${start} - Present`;
  }

  const end = formatDate(endDate, { year: 'numeric', month: 'short' });
  return `${start} - ${end}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Tags carry a fixed brand color (e.g. Django #092E20) used as a background, so the
// text on top can't follow the theme - it has to follow the background's luminance.
export function getReadableTextColor(background: string): string {
  const hex = background.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;

  if (full.length !== 6 || Number.isNaN(Number.parseInt(full, 16))) {
    return '#ffffff';
  }

  // WCAG relative luminance
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = channel(Number.parseInt(full.slice(0, 2), 16));
  const g = channel(Number.parseInt(full.slice(2, 4), 16));
  const b = channel(Number.parseInt(full.slice(4, 6), 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.45 ? '#0f172a' : '#ffffff';
}

export function generateOgImageUrl(title: string, baseUrl: string = ''): string {
  const params = new URLSearchParams({ title });
  return `${baseUrl}/api/og?${params.toString()}`;
}
