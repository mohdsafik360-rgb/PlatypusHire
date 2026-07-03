"use client";

import { useState } from "react";
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

type Tab = "main" | "misc";

/**
 * SidebarSections — the complete left-hand input pane.
 * Split into two tabs: Main (core resume sections) and Miscellaneous (settings & checks).
 */
export function SidebarSections() {
  const [activeTab, setActiveTab] = useState<Tab>("main");

  const workCount = useResumeStore((s) => s.workExperience.length);
  const eduCount = useResumeStore((s) => s.education.length);
  const skillCount = useResumeStore((s) => s.skillCategories.length);
  const projectCount = useResumeStore((s) => s.projects.length);
  const certCount = useResumeStore((s) => s.certifications.length);

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Tab Switcher ─────────────────────────────────────── */}
      <div className="flex rounded-lg bg-gray-100 p-1 gap-1">
        <button
          onClick={() => setActiveTab("main")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === "main"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Main
        </button>
        <button
          onClick={() => setActiveTab("misc")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === "misc"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Miscellaneous
        </button>
      </div>

      {/* ─── Main Sections ────────────────────────────────────── */}
      {activeTab === "main" && (
        <div className="flex flex-col gap-2">
          <SectionAccordion
            icon={User}
            label="Personal Info"
            defaultOpen
          >
            <div className="rounded-lg border border-border bg-white shadow-sm px-3 py-3">
              <PersonalInfoForm />
            </div>
          </SectionAccordion>

          <SectionAccordion
            icon={Briefcase}
            label="Work Experience"
            badge={workCount}
            defaultOpen
          >
            <WorkExperienceForm />
          </SectionAccordion>

          <SectionAccordion
            icon={GraduationCap}
            label="Education"
            badge={eduCount}
          >
            <EducationForm />
          </SectionAccordion>

          <SectionAccordion
            icon={Wrench}
            label="Skills"
            badge={skillCount}
          >
            <SkillsForm />
          </SectionAccordion>

          <SectionAccordion
            icon={FolderKanban}
            label="Projects"
            badge={projectCount}
          >
            <ProjectsForm />
          </SectionAccordion>

          <SectionAccordion
            icon={Award}
            label="Certifications"
            badge={certCount}
          >
            <CertificationsForm />
          </SectionAccordion>
        </div>
      )}

      {/* ─── Miscellaneous Sections ───────────────────────────── */}
      {activeTab === "misc" && (
        <div className="flex flex-col gap-2">
          <SectionAccordion
            icon={SlidersHorizontal}
            label="Resume Settings"
            defaultOpen
          >
            <ResumeSettingsForm />
          </SectionAccordion>

          <SectionAccordion
            icon={Gauge}
            label="Resume Check"
            defaultOpen
          >
            <ResumeQualityPanel />
          </SectionAccordion>
        </div>
      )}
    </div>
  );
}
