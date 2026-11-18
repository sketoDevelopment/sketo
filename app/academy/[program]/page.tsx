import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getInitialLanguage } from '@/app/components/getInitialLanguage';
import AcademyProgramClient from '../AcademyProgramClient';
import { programCopy } from '../course-programs';

type Props = { params: Promise<{ program: string }> };
function isProgram(value: string): value is keyof typeof programCopy { return value === 'author' || value === 'sca'; }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { program } = await params;
  if (!isProgram(program)) notFound();
  const language = await getInitialLanguage();
  return { title: `${programCopy[program].title[language]} | Sketo Academy`, description: programCopy[program].intro[language] };
}
export default async function AcademyProgramPage({ params }: Props) {
  const { program } = await params;
  if (!isProgram(program)) notFound();
  return <AcademyProgramClient program={program} initialLanguage={await getInitialLanguage()} />;
}
