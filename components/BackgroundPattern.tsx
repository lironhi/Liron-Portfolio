import { cn } from '@/lib/utils';

interface BackgroundPatternProps {
  variant?: 'dots' | 'grid' | 'waves' | 'gradient';
  className?: string;
}

export function BackgroundPattern({ variant = 'dots', className }: BackgroundPatternProps) {
  const patterns = {
    dots: (
      <div
        className={cn(
          'absolute inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]',
          className
        )}
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    ),
    grid: (
      <div
        className={cn(
          'absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.04]',
          className
        )}
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    ),
    waves: (
      <div className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
        <svg
          className="absolute w-full h-full opacity-[0.03] dark:opacity-[0.05]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="wave-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q 25 25, 50 50 T 100 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <path
                d="M0 60 Q 25 35, 50 60 T 100 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave-pattern)" />
        </svg>
      </div>
    ),
    gradient: (
      <div className={cn('absolute inset-0 -z-10', className)}>
        {/* Radial gradient blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>
    ),
  };

  return patterns[variant];
}

// Add to globals.css:
// @keyframes blob {
//   0%, 100% { transform: translate(0px, 0px) scale(1); }
//   33% { transform: translate(30px, -50px) scale(1.1); }
//   66% { transform: translate(-20px, 20px) scale(0.9); }
// }
// .animate-blob {
//   animation: blob 7s infinite;
// }
// .animation-delay-2000 {
//   animation-delay: 2s;
// }
// .animation-delay-4000 {
//   animation-delay: 4s;
// }
