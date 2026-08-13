import { data } from '@/lib/data';
import { CVPageClient } from './page-client';

export const metadata = {
  title: 'CV / Resume',
  description: 'Download my CV.',
};

export default async function CVPage() {
  const cvData = await data.getCVData();

  return <CVPageClient cvData={cvData} />;
}
