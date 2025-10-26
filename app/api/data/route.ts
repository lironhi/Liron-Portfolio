import { NextResponse } from 'next/server';
import { data } from '@/lib/data';

export async function GET() {
  try {
    const [skills, certificates, activeCertificates] = await Promise.all([
      data.getSkills(),
      data.getCertificates(),
      data.getActiveCertificates(),
    ]);

    return NextResponse.json({
      skills,
      certificates,
      activeCertificates,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
