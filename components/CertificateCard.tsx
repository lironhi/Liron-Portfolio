'use client';

import { Award, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Certificate } from '@/lib/data/types';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const isActive = certificate.expiryDate
    ? new Date(certificate.expiryDate) > new Date()
    : true;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  // Get issuer icon/color
  const getIssuerStyle = (issuer: string) => {
    const styles: Record<string, { icon: string; color: string }> = {
      Anthropic: { icon: '🤖', color: 'text-purple-600 dark:text-purple-400' },
      'Amazon Web Services': { icon: '☁️', color: 'text-orange-600 dark:text-orange-400' },
      AWS: { icon: '☁️', color: 'text-orange-600 dark:text-orange-400' },
      LangChain: { icon: '🔗', color: 'text-green-600 dark:text-green-400' },
      Udemy: { icon: '📚', color: 'text-purple-600 dark:text-purple-400' },
      Coursera: { icon: '🎓', color: 'text-blue-600 dark:text-blue-400' },
      Google: { icon: '🔵', color: 'text-blue-600 dark:text-blue-400' },
      Microsoft: { icon: '💠', color: 'text-blue-600 dark:text-blue-400' },
    };

    return styles[issuer] || { icon: '🏆', color: 'text-primary' };
  };

  const issuerStyle = getIssuerStyle(certificate.issuer);

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Active/Expired Badge */}
      {!isActive && (
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Expired
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{issuerStyle.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {certificate.name}
            </h3>
            <p className={`text-sm font-medium ${issuerStyle.color} mt-1`}>
              {certificate.issuer}
            </p>
          </div>
          {isActive && (
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        {certificate.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {certificate.description}
          </p>
        )}

        {/* Date Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Issued {formatDate(certificate.issueDate)}</span>
          {certificate.expiryDate && (
            <>
              <span>•</span>
              <span>
                {isActive ? 'Expires' : 'Expired'} {formatDate(certificate.expiryDate)}
              </span>
            </>
          )}
        </div>

        {/* Skills Tags */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {certificate.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {certificate.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{certificate.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {certificate.credentialUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs"
            >
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${certificate.name} credential`}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Certificate
              </a>
            </Button>
          )}

          {certificate.credentialId && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
              <Award className="h-3.5 w-3.5" />
              <span className="font-mono">{certificate.credentialId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
