"use client";
import Link from 'next/link';
import type { Language } from '../components/language';
import usePersistentLanguage from '../components/usePersistentLanguage';
import ShopHeaderActions from '../components/ShopHeaderActions';
import Footer from '../components/Footer';
import { academyLabels, getProgramCourses, programCopy, type ProgramId } from './course-programs';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp-order';
import styles from '../info/documents.module.css';
import orderStyles from '../components/ProductOrderButton.module.css';
import local from './program.module.css';

export default function AcademyProgramClient({ program, initialLanguage }: { program: ProgramId; initialLanguage: Language }) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const copy = programCopy[program];
  const courses = getProgramCourses(program, language);
  const signupLabel = language === 'en' ? 'Sign up' : language === 'kz' ? 'Жазылу' : 'Записаться';
  const signupUrl = (title: string, level: string) => {
    const courseName = [title, level].filter(Boolean).join(' · ');
    const message = language === 'en'
      ? `Hello! I'd like to sign up for ${courseName} (${copy.title[language]}). Please let me know the available dates and how to enrol.`
      : language === 'kz'
        ? `Сәлеметсіз бе! ${courseName} курсына (${copy.title[language]}) жазылғым келеді. Алдағы оқу күндері мен жазылу шарттарын айта аласыз ба?`
        : `Здравствуйте! Хочу записаться на курс «${courseName}» (${copy.title[language]}). Подскажите, пожалуйста, ближайшие даты и условия записи.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };
  return <div className={styles.shell}>
    <main className={styles.page}>
      <header className={styles.topline}>
        <Link className={styles.backLink} href="/academy">{academyLabels.back[language]}</Link>
        <ShopHeaderActions value={language} onChange={setLanguage} />
      </header>
      <header className={styles.documentHero}>
        <h1>{copy.title[language]}</h1>
        <p className={styles.documentIntro}>{copy.intro[language]}</p>
      </header>
      <div className={styles.layout}>
        <nav className={styles.nav} aria-label={copy.title[language]}>
          {(['author', 'sca'] as const).map((id, index) => <Link key={id} href={`/academy/${id}`} className={styles.navLink} aria-current={program === id ? 'page' : undefined}>
            <span className={styles.navIndex}>0{index + 1}</span><span>{programCopy[id].title[language]}</span>
          </Link>)}
        </nav>
        <article key={program} className={styles.article}>
          {courses.map((course, index) => <section key={`${course.title}-${course.level}`} className={styles.section}>
            <span className={styles.sectionIndex} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>{course.title}{course.level ? ` · ${course.level}` : ''}</h2>
              <div className={local.courseMeta}><span>{course.format}</span><span className={local.price}>{course.price}</span></div>
              <p>{course.lead}</p>
              {course.details.length > 0 && <ul className={local.details}>{course.details.map(detail => <li key={detail}>{detail}</li>)}</ul>}
              <div className={local.signup}>
                <a className={orderStyles.button} href={signupUrl(course.title, course.level)} target="_blank" rel="noopener noreferrer" aria-label={`${signupLabel}: ${course.title}${course.level ? ` · ${course.level}` : ''}`}>
                  <span className={orderStyles.label}>{signupLabel}</span>
                </a>
              </div>
            </div>
          </section>)}
          {program === 'sca' && <div className={styles.contact}>
            <p>{academyLabels.process[language]}</p>
          </div>}
        </article>
      </div>
    </main>
    <div className={styles.footer}><Footer language={language} /></div>
  </div>;
}
