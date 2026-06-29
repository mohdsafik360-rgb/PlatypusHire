"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useResumeStore } from "@/stores/useResumeStore";
import type { ResumeDensityMode } from "@/types/resume";
import { cn } from "@/lib/utils";

export function ResumeSettingsForm() {
  const settings = useResumeStore((s) => s.settings);
  const updateSettings = useResumeStore((s) => s.updateSettings);
  const fit = useResumeFitStatus();

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm px-3 py-3 space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Layout density</label>
        <select
          value={settings.densityMode}
          onChange={(e) => updateSettings({ densityMode: e.target.value as ResumeDensityMode })}
          className={cn(
            "h-8 w-full rounded-md border border-border bg-white px-3 text-sm shadow-xs",
            "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 outline-none transition-colors"
          )}
        >
          <option value="auto">Auto — fill the page</option>
          <option value="compact">Compact — fit more</option>
          <option value="normal">Normal — stable spacing</option>
          <option value="spacious">Spacious — use empty space</option>
        </select>
      </div>

      <label className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Force one-page resume</span>
        <input
          type="checkbox"
          checked={settings.forceOnePage}
          onChange={(e) => updateSettings({ forceOnePage: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
      </label>

      <FitMessage status={fit.status} scale={fit.scale} />
    </div>
  );
}

export function ResumeQualityPanel() {
  const basics = useResumeStore((s) => s.basics);
  const workExperience = useResumeStore((s) => s.workExperience);
  const education = useResumeStore((s) => s.education);
  const skillCategories = useResumeStore((s) => s.skillCategories);
  const projects = useResumeStore((s) => s.projects);
  const certifications = useResumeStore((s) => s.certifications);

  const issues = buildResumeIssues({ basics, workExperience, education, skillCategories, projects, certifications });
  const blocking = issues.filter((issue) => issue.level === "warning");

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm px-3 py-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium leading-tight">Resume check</p>
          <p className="text-[11px] text-muted-foreground leading-tight">Local checks only. No upload, no AI call.</p>
        </div>
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-medium",
          blocking.length ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
        )}>
          {blocking.length ? `${blocking.length} to fix` : "Clean"}
        </span>
      </div>

      <ul className="space-y-2">
        {issues.slice(0, 6).map((issue) => (
          <li key={issue.text} className="flex items-start gap-2 text-xs text-muted-foreground">
            {issue.level === "ok" ? (
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" strokeWidth={1.8} />
            ) : issue.level === "warning" ? (
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" strokeWidth={1.8} />
            ) : (
              <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
            )}
            <span>{issue.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type FitStatus = "spacious" | "balanced" | "dense" | "critical" | "overflow";

function useResumeFitStatus() {
  const [fit, setFit] = useState<{ status: FitStatus; scale: number }>({ status: "balanced", scale: 1 });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ status?: FitStatus; scale?: number }>).detail;
      setFit((current) => ({
        status: detail?.status ?? current.status,
        scale: typeof detail?.scale === "number" ? detail.scale : current.scale,
      }));
    };
    window.addEventListener("platypushire:resume-fit", handler);
    return () => window.removeEventListener("platypushire:resume-fit", handler);
  }, []);

  return fit;
}

function FitMessage({ status, scale }: { status: FitStatus; scale: number }) {
  const message = status === "critical"
    ? "Content fits, but text is getting too small. Hide weaker bullets or choose compact mode."
    : status === "dense"
      ? `Dense resume: currently scaled to ${Math.round(scale * 100)}%. Still readable, but watch long sections.`
      : status === "overflow"
        ? "Content exceeds one page because one-page forcing is disabled."
        : status === "spacious"
          ? "Short resume detected. Auto spacing is using more vertical room."
          : "Resume is balanced for one page.";

  return (
    <div className={cn(
      "rounded-md border px-2.5 py-2 text-[11px] leading-relaxed",
      status === "critical" || status === "overflow" ? "border-red-200 bg-red-50 text-red-700" :
        status === "dense" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
    )}>
      {message}
    </div>
  );
}

function buildResumeIssues({
  basics,
  workExperience,
  education,
  skillCategories,
  projects,
  certifications,
}: {
  basics: ReturnType<typeof useResumeStore.getState>["basics"];
  workExperience: ReturnType<typeof useResumeStore.getState>["workExperience"];
  education: ReturnType<typeof useResumeStore.getState>["education"];
  skillCategories: ReturnType<typeof useResumeStore.getState>["skillCategories"];
  projects: ReturnType<typeof useResumeStore.getState>["projects"];
  certifications: ReturnType<typeof useResumeStore.getState>["certifications"];
}) {
  const bullets = [
    ...workExperience.flatMap((w) => visibleLines(w.description, w.hiddenBulletIndices)),
    ...education.flatMap((e) => visibleLines(e.highlights, e.hiddenBulletIndices)),
    ...projects.flatMap((p) => visibleLines(p.description, p.hiddenBulletIndices)),
  ];
  const metricBullets = bullets.filter((b) => /\d|%|\$|RM|x\b|\b(k|m|million|thousand)\b/i.test(b)).length;
  const actionBullets = bullets.filter((b) => /^(built|led|created|improved|reduced|increased|managed|designed|launched|optimized|automated|delivered|implemented)\b/i.test(b)).length;

  return [
    basics.fullName.trim() && basics.email.trim()
      ? { level: "ok", text: "Core contact details are present." }
      : { level: "warning", text: "Add at least your name and email." },
    basics.summary.trim().length >= 80 && basics.summary.trim().length <= 420
      ? { level: "ok", text: "Summary length is in a good range." }
      : { level: "info", text: "Keep the summary around 2–4 concise lines." },
    workExperience.some((w) => w.company.trim() || w.position.trim())
      ? { level: "ok", text: "Work experience section has content." }
      : { level: "warning", text: "Add at least one role or project if you have no work history." },
    skillCategories.some((c) => c.skills.trim())
      ? { level: "ok", text: "Skills are listed for ATS keyword matching." }
      : { level: "warning", text: "Add a skills section with role-specific keywords." },
    bullets.length >= 3
      ? { level: "ok", text: `${bullets.length} visible achievement bullets.` }
      : { level: "info", text: "Use 3+ visible bullets to show impact." },
    metricBullets >= Math.min(3, bullets.length)
      ? { level: "ok", text: "Bullets include measurable results." }
      : { level: "info", text: "Add numbers, percentages, scope, or outcomes to stronger bullets." },
    actionBullets >= Math.min(3, bullets.length)
      ? { level: "ok", text: "Bullets use strong action verbs." }
      : { level: "info", text: "Start bullets with action verbs like Built, Led, Improved, or Automated." },
    education.some((e) => e.institution.trim()) || certifications.some((c) => c.name.trim())
      ? { level: "ok", text: "Education/certification signal is present." }
      : { level: "info", text: "Add education or certifications if relevant to the role." },
  ] as const;
}

function visibleLines(text: string, hiddenIndices: number[]) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((_, index) => !hiddenIndices.includes(index));
}
