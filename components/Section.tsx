import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  id?: string;
}

export function Section({ children, className, title, description, id }: SectionProps) {
  return (
    <section id={id} className={cn('py-16 sm:py-20', className)}>
      {(title || description) && (
        <div className="mb-12 text-center">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}