import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Badge } from '@/components/Badge';
import { data } from '@/lib/data';
import { formatDateRange } from '@/lib/utils';

export const metadata = {
  title: 'Education',
  description: 'My educational background and academic achievements.',
};

export default async function EducationPage() {
  const [education, certificates] = await Promise.all([
    data.getEducation(),
    data.getCertificates(),
  ]);

  const sortedEducation = education.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  const sortedCertificates = certificates.sort((a, b) => {
    const dateA = new Date(a.issueDate);
    const dateB = new Date(b.issueDate);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Section
      title="Education"
      description="My educational background, qualifications, and professional certifications"
    >
      <Container>
        <div className="space-y-16">
          {/* Education Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-foreground">Academic Education</h2>
            
            {sortedEducation.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No education data available.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedEducation.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {edu.degree} in {edu.field}
                          </h3>
                          <p className="text-primary font-medium">{edu.institution}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{formatDateRange(edu.startDate, edu.endDate)}</div>
                          <div>{edu.location}</div>
                        </div>
                      </div>

                      {edu.gpa && (
                        <div className="text-sm text-muted-foreground">
                          GPA: {edu.gpa}
                        </div>
                      )}

                      {edu.description && (
                        <p className="text-muted-foreground">{edu.description}</p>
                      )}

                      {edu.honors && edu.honors.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Honors & Awards:</h4>
                          <div className="flex flex-wrap gap-2">
                            {edu.honors.map((honor, index) => (
                              <Badge key={index} variant="secondary">
                                {honor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {edu.coursework && edu.coursework.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Relevant Coursework:</h4>
                          <div className="flex flex-wrap gap-2">
                            {edu.coursework.map((course, index) => (
                              <Badge key={index} variant="outline">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-foreground">Professional Certifications</h2>
            
            {sortedCertificates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No certifications available.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {sortedCertificates.map((cert) => {
                  const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
                  
                  return (
                    <div
                      key={cert.id}
                      className={`rounded-lg border bg-card p-6 hover:shadow-md transition-shadow ${
                        isExpired ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-foreground">{cert.name}</h3>
                          <p className="text-primary font-medium">{cert.issuer}</p>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div>Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                          {cert.expiryDate && (
                            <div className={isExpired ? 'text-destructive' : ''}>
                              {isExpired ? 'Expired' : 'Expires'}: {new Date(cert.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {cert.description && (
                          <p className="text-sm text-muted-foreground">{cert.description}</p>
                        )}

                        {cert.skills && cert.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cert.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {cert.credentialUrl && (
                          <div className="pt-2">
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View Credential →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}