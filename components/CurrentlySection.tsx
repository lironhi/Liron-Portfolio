'use client';

import { CheckCircle2, Compass, ExternalLink, Hammer, Rocket } from 'lucide-react';
import Link from 'next/link';
import type { Currently, CurrentlyItem, ShippedItem } from '@/lib/data/types';
import { FadeIn, StaggerContainer, StaggerItem } from './animations';
import { Badge } from './Badge';

interface CurrentlySectionProps {
  data: Currently;
}

/** One in-flight project - work or side project. */
function BuildCard({ item, accent }: { item: CurrentlyItem; accent: string }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border bg-card/60 p-5 backdrop-blur-xs shadow-e1 transition-all duration-300 hover:border-primary/40 hover:shadow-e2">
      <div
        className={`absolute -right-16 -top-16 h-32 w-32 rounded-full ${accent} transition-transform duration-500 group-hover:scale-110`}
      />
      <div className="relative space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none" aria-hidden="true">
            {item.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold leading-snug text-foreground">{item.title}</h4>
            {item.context && (
              <p className="font-mono text-xs font-medium uppercase tracking-wide text-primary">
                {item.context}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>

        {item.technologies && item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShippedRow({ item }: { item: ShippedItem }) {
  const body = (
    <>
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-foreground">{item.title}</span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{item.when}</span>
          {item.link && (
            <ExternalLink
              className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </>
  );

  const className =
    'group flex gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/40';

  return item.link ? (
    <Link href={item.link} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function GroupHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function CurrentlySection({ data }: CurrentlySectionProps) {
  return (
    <div className="space-y-10">
      {data.shipping.length > 0 && (
        <FadeIn>
          <GroupHeading
            icon={<Rocket className="h-5 w-5" />}
            title="Shipping now"
            subtitle="Paid work in flight"
          />
          <StaggerContainer staggerDelay={0.08}>
            <div className="grid gap-4 md:grid-cols-2">
              {data.shipping.map((item) => (
                <StaggerItem key={item.id}>
                  <BuildCard item={item} accent="bg-primary/5" />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </FadeIn>
      )}

      {data.building.length > 0 && (
        <FadeIn delay={0.1}>
          <GroupHeading
            icon={<Hammer className="h-5 w-5" />}
            title="Building on the side"
            subtitle="Where the curiosity goes"
          />
          <StaggerContainer staggerDelay={0.08}>
            <div className="grid gap-4">
              {data.building.map((item) => (
                <StaggerItem key={item.id}>
                  <BuildCard item={item} accent="bg-purple-500/5" />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </FadeIn>
      )}

      {data.shipped.length > 0 && (
        <FadeIn delay={0.15}>
          <GroupHeading
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Recently shipped"
            subtitle="Done and live"
          />
          <div className="space-y-1">
            {data.shipped.map((item) => (
              <ShippedRow key={item.id} item={item} />
            ))}
          </div>
        </FadeIn>
      )}

      {data.exploring.length > 0 && (
        <FadeIn delay={0.2}>
          <div className="flex flex-wrap items-center gap-2 border-t pt-6">
            <span className="mr-1 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Currently exploring
            </span>
            {data.exploring.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.title}
              </span>
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
