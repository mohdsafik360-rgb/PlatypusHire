"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useResumeStore } from "@/stores/useResumeStore";
import { formatDate, formatDateRange } from "@/lib/date";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

const PHOTO_W_PX = 35 * 3;
const PHOTO_H_PX = 45 * 3;
const A4_H_PX = 297 * 3;
const LINK_RE = /((?:https?:\/\/|www\.)[^\s<>()]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>()]*)?)/g;

const sectionFade: Pick<HTMLMotionProps<"section">, "initial" | "animate" | "exit" | "transition"> = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.25 },
};

export function ResumePreview() {
  const basics = useResumeStore((s) => s.basics);
  const workExperience = useResumeStore((s) => s.workExperience);
  const education = useResumeStore((s) => s.education);
  const skillCategories = useResumeStore((s) => s.skillCategories);
  const projects = useResumeStore((s) => s.projects);
  const certifications = useResumeStore((s) => s.certifications);
  const settings = useResumeStore((s) => s.settings);
  const pageRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasPhoto = basics.includePassportPhoto !== false && !!basics.passportPhotoUrl;
  const photoScale = clamp(basics.passportPhotoScale || 1, 0.7, 1.35);
  const photoWidth = PHOTO_W_PX * photoScale;
  const photoHeight = PHOTO_H_PX * photoScale;
  const hasSummary = basics.summary.trim().length > 0;
  const hasWork = workExperience.some(hasContent);
  const hasEdu = education.some(hasContent);
  const hasSkills = skillCategories.some((c) => c.skills.trim().length > 0);
  const hasProjects = projects.some(hasContent);
  const hasCerts = certifications.some((c) => c.name.trim().length > 0);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const content = contentRef.current;
    if (!page || !content) return;

    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        page.style.setProperty("--resume-fit-scale", "1");
        page.style.setProperty("--resume-density", "1");

        const availableHeight = A4_H_PX - 6;
        const rawHeight = content.scrollHeight;
        if (rawHeight <= 0) return;

        const density = resolveDensity(settings.densityMode, rawHeight, availableHeight);
        page.style.setProperty("--resume-density", String(density));

        // Re-measure after density update.
        const adjustedHeight = content.scrollHeight;
        const scale = settings.forceOnePage
          ? Math.min(1, Math.max(0.48, availableHeight / adjustedHeight))
          : 1;
        page.style.setProperty("--resume-fit-scale", String(scale));
        page.dataset.fitScale = scale.toFixed(3);
        page.dataset.fitStatus = fitStatus(scale, adjustedHeight, availableHeight);

        window.dispatchEvent(new CustomEvent("platypushire:resume-fit", {
          detail: { scale, adjustedHeight, availableHeight, density, status: page.dataset.fitStatus },
        }));
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(content);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [basics, workExperience, education, skillCategories, projects, certifications, settings]);

  return (
    <article
      id="resume-preview"
      ref={pageRef}
      className={`resume-page text-[11px] leading-[1.45] text-gray-800 font-sans ${settings.forceOnePage ? "overflow-hidden" : "overflow-visible"}`}
    >
      <div ref={contentRef} className="resume-content-fitter">
        <header className="resume-header px-10 pt-10">
          <div
            className={`resume-header-grid ${hasPhoto ? "resume-header-grid--with-photo" : ""}`}
            style={hasPhoto ? {
              gridTemplateColumns: `minmax(0, 1fr) ${photoWidth}px`,
              ["--resume-photo-width" as string]: `${photoWidth}px`,
              ["--resume-photo-height" as string]: `${photoHeight}px`,
            } : undefined}
          >
            <div className="resume-header-content min-w-0">
              <h1 className="text-[22px] leading-tight font-bold text-gray-900 tracking-tight m-0 break-words">
                {basics.fullName || <span className="text-gray-300">Your Name</span>}
              </h1>

              {basics.jobTitle && (
                <p className="mt-1 text-[12px] font-medium text-gray-500 m-0 break-words">
                  <LinkifiedText text={basics.jobTitle} />
                </p>
              )}

              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-600 list-none m-0 p-0">
                {basics.email && (
                  <li className="flex min-w-0 items-center gap-1">
                    <Mail className="size-3 shrink-0 text-gray-400" strokeWidth={1.5} />
                    <a className="resume-link break-all" href={`mailto:${basics.email}`}>{basics.email}</a>
                  </li>
                )}
                {basics.phone && (
                  <li className="flex min-w-0 items-center gap-1">
                    <Phone className="size-3 shrink-0 text-gray-400" strokeWidth={1.5} />
                    <span className="break-words">{basics.phone}</span>
                  </li>
                )}
                {basics.location && (
                  <li className="flex min-w-0 items-center gap-1">
                    <MapPin className="size-3 shrink-0 text-gray-400" strokeWidth={1.5} />
                    <span className="break-words">{basics.location}</span>
                  </li>
                )}
                {basics.website && <ContactLink icon={<Globe className="size-3 shrink-0 text-gray-400" strokeWidth={1.5} />} href={basics.website} label={basics.websiteLabel} />}
                {basics.linkedin && <ContactLink icon={<Linkedin className="size-3 shrink-0 text-gray-400" strokeWidth={1.5} />} href={basics.linkedin} label={basics.linkedinLabel} />}
                {basics.github && <ContactLink icon={<Github className="size-3 shrink-0 text-gray-400" strokeWidth={1.5} />} href={basics.github} label={basics.githubLabel} />}
              </ul>
            </div>

            {hasPhoto && (
              <div className="resume-photo shrink-0" aria-hidden={!basics.fullName}>
                <img
                  src={basics.passportPhotoUrl}
                  alt={`${basics.fullName || "Resume"} passport photo`}
                  className="rounded object-cover border border-gray-200"
                />
              </div>
            )}
          </div>
        </header>

        <AnimatePresence initial={false}>
          {hasSummary && (
            <motion.section key="summary" className="px-10 pt-5" {...sectionFade}>
              <h2 className="resume-section-title">Professional Summary</h2>
              <p className="resume-body-text mt-2"><LinkifiedText text={basics.summary} /></p>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {hasWork && (
            <motion.section key="work" className="px-10 pt-5" {...sectionFade}>
              <h2 className="resume-section-title">Work Experience</h2>
              <div className="mt-3 space-y-4">
                {workExperience.filter(hasContent).map((exp) => {
                  const visibleBullets = getVisibleBullets(exp.description, exp.hiddenBulletIndices);
                  return (
                    <div key={exp.id} className="resume-entry">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-[12px] font-semibold text-gray-900 leading-tight m-0"><LinkifiedText text={exp.position || "Position"} /></h3>
                          <p className="text-[11px] text-gray-600 m-0 mt-0.5"><LinkifiedText text={`${exp.company}${exp.location ? ` · ${exp.location}` : ""}`} /></p>
                        </div>
                        <p className="text-[10px] text-gray-500 whitespace-nowrap shrink-0 m-0">{formatDateRange(exp.startDate, exp.isCurrent ? "present" : exp.endDate)}</p>
                      </div>
                      {visibleBullets.length > 0 && <BulletList id={exp.id} bullets={visibleBullets} />}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {hasEdu && (
            <motion.section key="education" className="px-10 pt-5" {...sectionFade}>
              <h2 className="resume-section-title">Education</h2>
              <div className="mt-3 space-y-4">
                {education.filter(hasContent).map((edu) => {
                  const visibleBullets = getVisibleBullets(edu.highlights, edu.hiddenBulletIndices);
                  const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
                  return (
                    <div key={edu.id} className="resume-entry">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-[12px] font-semibold text-gray-900 leading-tight m-0"><LinkifiedText text={degreeLine || edu.institution || "Institution"} /></h3>
                          <p className="text-[11px] text-gray-600 m-0 mt-0.5"><LinkifiedText text={`${edu.institution}${edu.gpa ? ` · GPA: ${edu.gpa}` : ""}`} /></p>
                        </div>
                        <p className="text-[10px] text-gray-500 whitespace-nowrap shrink-0 m-0">{formatDateRange(edu.startDate, edu.endDate)}</p>
                      </div>
                      {visibleBullets.length > 0 && <BulletList id={edu.id} bullets={visibleBullets} />}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {hasSkills && (
            <motion.section key="skills" className="px-10 pt-5" {...sectionFade}>
              <h2 className="resume-section-title">Skills</h2>
              <ul className="mt-2 space-y-1.5 list-none m-0 p-0">
                {skillCategories.filter((c) => c.skills.trim().length > 0).map((cat) => (
                  <motion.li key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex gap-2 text-[11px]">
                    <span className="font-semibold text-gray-900 shrink-0">{cat.name || "Category"}:</span>
                    <span className="text-gray-700"><LinkifiedText text={cat.skills} /></span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {hasProjects && (
            <motion.section key="projects" className="px-10 pt-5" {...sectionFade}>
              <h2 className="resume-section-title">Projects</h2>
              <div className="mt-3 space-y-4">
                {projects.filter(hasContent).map((proj) => {
                  const visibleBullets = getVisibleBullets(proj.description, proj.hiddenBulletIndices);
                  return (
                    <div key={proj.id} className="resume-entry">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-[12px] font-semibold text-gray-900 leading-tight m-0"><LinkifiedText text={proj.name || "Project"} /></h3>
                        <p className="text-[10px] text-gray-500 whitespace-nowrap shrink-0 m-0">{formatDateRange(proj.startDate, proj.endDate)}</p>
                      </div>
                      {proj.technologies && <p className="text-[10px] text-gray-500 mt-0.5 m-0"><LinkifiedText text={proj.technologies} /></p>}
                      {proj.url && <p className="text-[10px] text-gray-400 mt-0.5 m-0 break-all"><UrlAnchor text={proj.url} /></p>}
                      {visibleBullets.length > 0 && <BulletList id={proj.id} bullets={visibleBullets} />}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {hasCerts && (
            <motion.section key="certifications" className="px-10 pt-5" {...sectionFade}>
              <h2 className="resume-section-title">Certifications</h2>
              <ul className="mt-2 space-y-1.5 list-none m-0 p-0">
                {certifications.filter((c) => c.name.trim().length > 0).map((cert) => (
                  <motion.li key={cert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span>
                      <span className="font-semibold text-gray-900"><LinkifiedText text={cert.name} /></span>
                      {cert.issuer ? <> — <LinkifiedText text={cert.issuer} /></> : ""}
                      {cert.credentialId ? ` (${cert.credentialId})` : ""}
                      {cert.url ? <> · <UrlAnchor text={cert.url} /></> : ""}
                    </span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">{formatDate(cert.date)}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}

function BulletList({ id, bullets }: { id: string; bullets: string[] }) {
  return (
    <ul className="resume-bullet-list mt-1.5">
      <AnimatePresence initial={false}>
        {bullets.map((b, i) => (
          <motion.li key={`${id}-${i}`} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 4 }} transition={{ duration: 0.2 }}>
            <LinkifiedText text={b} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function ContactLink({ icon, href, label }: { icon: ReactNode; href: string; label?: string }) {
  const displayText = label?.trim() || href;
  return (
    <li className="flex min-w-0 items-center gap-1">
      {icon}
      <UrlAnchor text={href} displayText={displayText} />
    </li>
  );
}

function LinkifiedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    parts.push(<UrlAnchor key={`${value}-${index}`} text={trimTrailingPunctuation(value)} trailing={value.slice(trimTrailingPunctuation(value).length)} />);
    last = index + value.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function UrlAnchor({ text, displayText, trailing = "" }: { text: string; displayText?: string; trailing?: string }) {
  const href = normalizeUrl(text);
  return <><a className="resume-link break-all" href={href} target="_blank" rel="noreferrer">{displayText || text}</a>{trailing}</>;
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function trimTrailingPunctuation(value: string): string {
  return value.replace(/[.,;:!?]+$/, "");
}

function hasContent(item: object): boolean {
  const strFields = Object.values(item).filter((v): v is string => typeof v === "string");
  return strFields.some((value) => value.trim().length > 0);
}

function getVisibleBullets(text: string, hiddenIndices: number[]): string[] {
  if (!text.trim()) return [];
  return text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0).filter((_, i) => !hiddenIndices.includes(i));
}

function resolveDensity(mode: "auto" | "compact" | "normal" | "spacious", rawHeight: number, availableHeight: number): number {
  if (mode === "compact") return 0.88;
  if (mode === "normal") return 1;
  if (mode === "spacious") return 1.12;

  // Auto preserves the current visual style but adapts the vertical rhythm.
  if (rawHeight < availableHeight * 0.66) return 1.14;
  if (rawHeight < availableHeight * 0.78) return 1.08;
  if (rawHeight > availableHeight * 1.08) return 0.92;
  return 1;
}

function fitStatus(scale: number, height: number, availableHeight: number): "spacious" | "balanced" | "dense" | "critical" | "overflow" {
  if (height > availableHeight && scale >= 0.995) return "overflow";
  if (scale < 0.62) return "critical";
  if (scale < 0.82) return "dense";
  if (scale > 0.99 && height < availableHeight * 0.72) return "spacious";
  return "balanced";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
