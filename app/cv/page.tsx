import { data } from '@/lib/data';
import { CVPageClient } from './page-client';

export const metadata = {
  title: 'CV / Resume',
  description: 'Download my CV in multiple languages: English, French, and Hebrew.',
};

export default async function CVPage() {
  const cvData = await data.getCVData();

  return <CVPageClient cvData={cvData} />;
}
