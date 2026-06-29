"use client";

import { useResumeStore } from "@/stores/useResumeStore";
import { cn } from "@/lib/utils";

/**
 * ATSScoreIndicator — a decorative circular progress indicator that
 * shows a dummy "ATS Match" score in the top bar. Matches Teal's
 * premium UI feel.
 *
 * The score is computed client-side from basic heuristics (purely
 * aesthetic — this is a static calculation, not an AI evaluation).
 */
export function ATSScoreIndicator() {
  const basics = useResumeStore((s) => s.basics);
  const workExperience = useResumeStore((s) => s.workExperience);
  const education = useResumeStore((s) => s.education);
  const skillCategories = useResumeStore((s) => s.skillCategories);
  const projects = useResumeStore((s) => s.projects);
  const certifications = useResumeStore((s) => s.certifications);

  // Simple heuristic: reward filled fields
  const score = computeScore(
    basics,
    workExperience,
    education,
    skillCategories,
    projects,
    certifications
  );
  const clamped = Math.min(100, Math.max(0, score));

  // SVG circle geometry
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Color tiers
  const colorClass =
    clamped >= 75
      ? "text-emerald-500"
      : clamped >= 45
        ? "text-amber-500"
        : "text-red-400";

  const textColorClass =
    clamped >= 75
      ? "text-emerald-600"
      : clamped >= 45
        ? "text-amber-600"
        : "text-red-500";

  const label =
    clamped >= 75
      ? "Great match!"
      : clamped >= 45
        ? "Add more details"
        : "Get started";

  return (
    <div
      className="flex items-center gap-2 cursor-default select-none"
      title={`ATS Compatibility Score: ${clamped}%`}
    >
      {/* Circular progress ring */}
      <div className="relative flex items-center justify-center">
        <svg
          className={cn("size-9 -rotate-90", colorClass)}
          viewBox="0 0 36 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          {/* Background track */}
          <circle
            cx="18"
            cy="18"
            r={radius}
            className="text-muted/50"
            stroke="currentColor"
            opacity={0.25}
          />
          {/* Progress arc */}
          <circle
            cx="18"
            cy="18"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className={cn(
            "absolute text-[10px] font-bold tabular-nums",
            textColorClass
          )}
        >
          {clamped}
        </span>
      </div>

      {/* Label */}
      <div className="hidden sm:flex flex-col">
        <span className="text-xs font-medium leading-tight text-foreground">
          ATS Score
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Heuristic scoring ──────────────────────────────────────────────

interface ScoreInputs {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  linkedinLabel: string;
  website: string;
  websiteLabel: string;
  github: string;
  githubLabel: string;
  summary: string;
  passportPhotoUrl: string;
}

function computeScore(
  basics: ScoreInputs,
  work: { description: string }[],
  edu: { highlights: string }[],
  skills: { skills: string }[],
  projects: { description: string }[],
  certs: { name: string }[]
): number {
  let s = 0;

  // Name + title (essential)
  if (basics.fullName.trim()) s += 10;
  if (basics.jobTitle.trim()) s += 5;

  // Contact info (each worth a few points)
  if (basics.email.trim()) s += 8;
  if (basics.phone.trim()) s += 5;
  if (basics.location.trim()) s += 4;
  if (basics.linkedin.trim()) s += 4;
  if (basics.website.trim()) s += 2;
  if (basics.github.trim()) s += 2;

  // Summary
  if (basics.summary.trim().length > 20) s += 10;

  // Work experience
  if (work.length > 0) s += 10;
  if (work.some((w) => w.description.trim().length > 0)) s += 10;
  if (work.length >= 2) s += 5;

  // Education
  if (edu.length > 0) s += 10;
  if (edu.some((e) => e.highlights.trim().length > 0)) s += 5;

  // Skills
  if (skills.length > 0) s += 8;
  if (skills.some((c) => c.skills.trim().length > 0)) s += 7;

  // Projects
  if (projects.length > 0) s += 5;
  if (projects.some((p) => p.description.trim().length > 0)) s += 4;

  // Certifications
  if (certs.some((c) => c.name.trim().length > 0)) s += 4;

  // Photo bonus
  if (basics.passportPhotoUrl) s += 3;

  return s;
}
