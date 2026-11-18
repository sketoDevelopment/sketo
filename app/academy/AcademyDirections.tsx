import Link from 'next/link';
import type { Language } from '../components/language';
import { programCopy } from './course-programs';
import styles from './page.module.css';
import documents from '../info/documents.module.css';

export default function AcademyDirections({ language }: { language: Language }) {
  return <div className={styles.courseAccordion}>
    {(['author', 'sca'] as const).map((id, index) => <Link key={id} href={`/academy/${id}`} className={documents.indexLink}>
      <span className={documents.indexNumber} aria-hidden="true">0{index + 1}</span>
      <span className={documents.indexTitle}>{programCopy[id].title[language]}</span>
      <svg className={documents.arrow} width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true"><path d="M1 7h17M13 1.5 18.5 7 13 12.5" stroke="currentColor" strokeWidth="1.25" /></svg>
    </Link>)}
  </div>;
}
