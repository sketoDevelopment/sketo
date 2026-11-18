"use client";

import { useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AcademyDirections from "./AcademyDirections";
import type { Language } from "../components/language";
import styles from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

type AcademyCourseShowcaseProps = {
  language: Language;
  displayLabel: string;
  displayLines: readonly string[];
  introTexts: readonly string[];
};

export default function AcademyCourseShowcase({
  language,
  displayLabel,
  displayLines,
  introTexts,
}: AcademyCourseShowcaseProps) {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const revealPathRef = useRef<SVGPathElement | null>(null);
  const clipPathId = useId().replace(/:/g, "");
  const outlineFilterId = useId().replace(/:/g, "");
  const lineStart = 132;
  const lineStep = 126;
  const svgHeight = lineStart + (displayLines.length - 1) * lineStep + 92;

  const buildWavePath = (y: number) => {
    const amplitude = 24;
    const phase = y * 0.045;
    const y1 = y + Math.sin(phase) * amplitude;
    const y2 = y + Math.sin(phase + 1.2) * amplitude;
    const y3 = y + Math.sin(phase + 2.4) * amplitude;
    const y4 = y + Math.sin(phase + 3.6) * amplitude;

    return [
      "M 0 0",
      "H 980",
      `V ${Math.max(-120, y1)}`,
      `C 860 ${y1} 760 ${y2} 640 ${y2}`,
      `S 420 ${y3} 320 ${y3}`,
      `S 100 ${y4} 0 ${y4}`,
      "Z",
    ].join(" ");
  };

  useLayoutEffect(() => {
    const showcase = showcaseRef.current;
    const revealPath = revealPathRef.current;

    if (!showcase || !revealPath) {
      return;
    }

      const ctx = gsap.context(() => {
        const state = { y: -140 };
        const isMobile = window.matchMedia("(max-width: 640px)").matches;

      revealPath.setAttribute("d", buildWavePath(state.y));

      gsap.to(state, {
        y: svgHeight + 80,
        ease: "none",
        onUpdate: () => {
          revealPath.setAttribute("d", buildWavePath(state.y));
        },
        scrollTrigger: {
          trigger: showcase,
          start: isMobile ? "top 70%" : "top 75%", 
          end: isMobile ? "bottom 150%" : "bottom 85%",
          scrub: true,
        },
      });
    }, showcase);

    return () => {
      ctx.revert();
    };
  }, [svgHeight]);

  return (
    <div ref={showcaseRef} className={styles.courseShowcase}>
      <div className={styles.courseStickyColumn}>
        <div className={styles.courseStickyWrapper}>
          <div className={styles.courseStatement}>
            <svg
              className={styles.courseDisplaySvg}
              viewBox={`0 0 980 ${svgHeight}`}
              role="img"
              aria-label={displayLabel}
            >
              <defs>
                <filter
                  id={outlineFilterId}
                  x="-4%"
                  y="-4%"
                  width="108%"
                  height="108%"
                  colorInterpolationFilters="sRGB"
                >
                  <feMorphology
                    in="SourceAlpha"
                    operator="dilate"
                    radius="1.2"
                    result="expanded"
                  />
                  <feComposite
                    in="expanded"
                    in2="SourceAlpha"
                    operator="out"
                    result="outerStroke"
                  />
                  <feFlood floodColor="#ce1616" result="strokeColor" />
                  <feComposite
                    in="strokeColor"
                    in2="outerStroke"
                    operator="in"
                    result="strokeFill"
                  />
                  <feMerge>
                    <feMergeNode in="strokeFill" />
                  </feMerge>
                </filter>

                <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
                  <path ref={revealPathRef} d="M 0 0 H 980 V 0 H 0 Z" />
                </clipPath>
              </defs>

              <g filter={`url(#${outlineFilterId})`}>
                {displayLines.map((line, index) => (
                  <text
                    key={`outline-${line}`}
                    className={styles.courseDisplayText}
                    x="4"
                    y={lineStart + index * lineStep}
                  >
                    {line}
                  </text>
                ))}
              </g>

              <g clipPath={`url(#${clipPathId})`}>
                {displayLines.map((line, index) => (
                  <text
                    key={`fill-${line}`}
                    className={styles.courseDisplayTextFilled}
                    x="4"
                    y={lineStart + index * lineStep}
                  >
                    {line}
                  </text>
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className={styles.courseContent}>
        <div className={styles.courseIntro}>
          {introTexts.map((text) => (
            <p key={text} className={styles.courseIntroText}>
              {text}
            </p>
          ))}
        </div>

        <AcademyDirections language={language} />
      </div>
    </div>
  );
}
