"use client";

import { useResumeStore } from "@/stores/useResumeStore";
import { SectionAccordion } from "./SectionAccordion";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { EducationForm } from "./EducationForm";
import { SkillsForm } from "./SkillsForm";
import { ProjectsForm } from "./ProjectsForm";
import { CertificationsForm } from "./CertificationsForm";
import { ResumeQualityPanel, ResumeSettingsForm } from "./ResumeSettingsForm";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Award,
  Gauge,
  SlidersHorizontal,
} from "lucide-react";

/**
 * SidebarSections — the complete left-hand input pane.
 * Renders each resume section as a collapsible accordion card.
 * Teal-style: gray-50 background, white cards, compact spacing.
 */
export function SidebarSections() {
  const workCount = useResumeStore((s) => s.workExperience.length);
  const eduCount = useResumeStore((s) => s.education.length);
  const skillCount = useResumeStore((s) => s.skillCategories.length);
  const projectCount = useResumeStore((s) => s.projects.length);
  const certCount = useResumeStore((s) => s.certifications.length);

  return (
    <div className="flex flex-col gap-2">
      {/* ─── Personal Info ────────────────────────────────────── */}
      <SectionAccordion
        icon={User}
        label="Personal Info"
        defaultOpen
      >
        <div className="rounded-lg border border-border bg-white shadow-sm px-3 py-3">
          <PersonalInfoForm />
        </div>
      </SectionAccordion>


      {/* ─── Resume Settings ──────────────────────────────────── */}
      <SectionAccordion
        icon={SlidersHorizontal}
        label="Resume Settings"
      >
        <ResumeSettingsForm />
      </SectionAccordion>

      {/* ─── Resume Check ─────────────────────────────────────── */}
      <SectionAccordion
        icon={Gauge}
        label="Resume Check"
      >
        <ResumeQualityPanel />
      </SectionAccordion>

      {/* ─── Work Experience ──────────────────────────────────── */}
      <SectionAccordion
        icon={Briefcase}
        label="Work Experience"
        badge={workCount}
        defaultOpen
      >
        <WorkExperienceForm />
      </SectionAccordion>

      {/* ─── Education ────────────────────────────────────────── */}
      <SectionAccordion
        icon={GraduationCap}
        label="Education"
        badge={eduCount}
      >
        <EducationForm />
      </SectionAccordion>

      {/* ─── Skills ───────────────────────────────────────────── */}
      <SectionAccordion
        icon={Wrench}
        label="Skills"
        badge={skillCount}
      >
        <SkillsForm />
      </SectionAccordion>

      {/* ─── Projects ─────────────────────────────────────────── */}
      <SectionAccordion
        icon={FolderKanban}
        label="Projects"
        badge={projectCount}
      >
        <ProjectsForm />
      </SectionAccordion>

      {/* ─── Certifications ───────────────────────────────────── */}
      <SectionAccordion
        icon={Award}
        label="Certifications"
        badge={certCount}
      >
        <CertificationsForm />
      </SectionAccordion>
    </div>
  );
}
