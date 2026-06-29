import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ResumeData, ResumeDensityMode } from "@/types/resume";

// ─── Default / empty state ───────────────────────────────────────────
function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const defaultResume: ResumeData = {
  basics: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    websiteLabel: "Website",
    linkedin: "",
    linkedinLabel: "LinkedIn",
    github: "",
    githubLabel: "GitHub",
    summary: "",
    passportPhotoUrl: "",
    includePassportPhoto: true,
    passportPhotoScale: 1,
  },
  workExperience: [],
  education: [],
  skillCategories: [],
  projects: [],
  certifications: [],
  settings: {
    densityMode: "auto",
    forceOnePage: true,
  },
};

const STORAGE_KEY = "platypushire-resume";

// ─── Load from localStorage (client-only) ────────────────────────────
function loadPersistedState(): ResumeData | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return normalizeResumeData(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asDensityMode(value: unknown): ResumeDensityMode {
  return value === "compact" || value === "normal" || value === "spacious" ? value : "auto";
}

function asNumberInRange(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function asStringArrayIndices(value: unknown, maxLines?: number): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)]
    .filter((index): index is number => Number.isInteger(index) && index >= 0 && (maxLines === undefined || index < maxLines))
    .sort((a, b) => a - b);
}

function lineCount(value: string): number {
  return value.trim() ? value.split("\n").length : 1;
}

function normalizeResumeData(value: unknown): ResumeData {
  const raw = asRecord(value);
  const basics = asRecord(raw.basics);

  return {
    basics: {
      ...defaultResume.basics,
      fullName: asString(basics.fullName),
      jobTitle: asString(basics.jobTitle),
      email: asString(basics.email),
      phone: asString(basics.phone),
      location: asString(basics.location),
      website: asString(basics.website),
      websiteLabel: asString(basics.websiteLabel, defaultResume.basics.websiteLabel),
      linkedin: asString(basics.linkedin),
      linkedinLabel: asString(basics.linkedinLabel, defaultResume.basics.linkedinLabel),
      github: asString(basics.github),
      githubLabel: asString(basics.githubLabel, defaultResume.basics.githubLabel),
      summary: asString(basics.summary),
      passportPhotoUrl: asString(basics.passportPhotoUrl),
      includePassportPhoto: basics.includePassportPhoto !== false,
      passportPhotoScale: asNumberInRange(basics.passportPhotoScale, 1, 0.7, 1.35),
    },
    workExperience: Array.isArray(raw.workExperience) ? raw.workExperience.map((item) => {
      const source = asRecord(item);
      const description = asString(source.description);
      return {
        id: asString(source.id) || uid(),
        company: asString(source.company),
        position: asString(source.position),
        location: asString(source.location),
        startDate: asString(source.startDate),
        endDate: asString(source.endDate),
        isCurrent: source.isCurrent === true,
        description,
        hiddenBulletIndices: asStringArrayIndices(source.hiddenBulletIndices, lineCount(description)),
      };
    }) : [],
    education: Array.isArray(raw.education) ? raw.education.map((item) => {
      const source = asRecord(item);
      const highlights = asString(source.highlights);
      return {
        id: asString(source.id) || uid(),
        institution: asString(source.institution),
        degree: asString(source.degree),
        field: asString(source.field),
        location: asString(source.location),
        startDate: asString(source.startDate),
        endDate: asString(source.endDate),
        gpa: asString(source.gpa),
        highlights,
        hiddenBulletIndices: asStringArrayIndices(source.hiddenBulletIndices, lineCount(highlights)),
      };
    }) : [],
    skillCategories: Array.isArray(raw.skillCategories) ? raw.skillCategories.map((item) => {
      const source = asRecord(item);
      return {
        id: asString(source.id) || uid(),
        name: asString(source.name),
        skills: asString(source.skills),
      };
    }) : [],
    projects: Array.isArray(raw.projects) ? raw.projects.map((item) => {
      const source = asRecord(item);
      const description = asString(source.description);
      return {
        id: asString(source.id) || uid(),
        name: asString(source.name),
        description,
        url: asString(source.url),
        technologies: asString(source.technologies),
        startDate: asString(source.startDate),
        endDate: asString(source.endDate),
        hiddenBulletIndices: asStringArrayIndices(source.hiddenBulletIndices, lineCount(description)),
      };
    }) : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications.map((item) => {
      const source = asRecord(item);
      return {
        id: asString(source.id) || uid(),
        name: asString(source.name),
        issuer: asString(source.issuer),
        date: asString(source.date),
        url: asString(source.url),
        credentialId: asString(source.credentialId),
      };
    }) : [],
    settings: {
      densityMode: asDensityMode(asRecord(raw.settings).densityMode),
      forceOnePage: asBoolean(asRecord(raw.settings).forceOnePage, true),
    },
  };
}

export function normalizeResumeImport(value: unknown): ResumeData {
  return normalizeResumeData(value);
}

// ─── Store actions ───────────────────────────────────────────────────
interface ResumeActions {
  hydrate: () => void;

  // Basics
  updateBasics: (patch: Partial<ResumeData["basics"]>) => void;
  updateSettings: (patch: Partial<ResumeData["settings"]>) => void;
  replaceResume: (data: ResumeData) => void;

  // Work Experience
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, patch: Partial<ResumeData["workExperience"][number]>) => void;
  removeWorkExperience: (id: string) => void;
  toggleBulletVisibility: (id: string, index: number) => void;

  // Education
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<ResumeData["education"][number]>) => void;
  removeEducation: (id: string) => void;
  toggleHighlightVisibility: (id: string, index: number) => void;

  // Skill Categories
  addSkillCategory: () => void;
  updateSkillCategory: (id: string, patch: Partial<ResumeData["skillCategories"][number]>) => void;
  removeSkillCategory: (id: string) => void;

  // Projects
  addProject: () => void;
  updateProject: (id: string, patch: Partial<ResumeData["projects"][number]>) => void;
  removeProject: (id: string) => void;
  toggleProjectBulletVisibility: (id: string, index: number) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<ResumeData["certifications"][number]>) => void;
  removeCertification: (id: string) => void;

  // Reorder (drag-and-drop)
  reorderWorkExperience: (fromIndex: number, toIndex: number) => void;
  reorderEducation: (fromIndex: number, toIndex: number) => void;
  reorderSkillCategories: (fromIndex: number, toIndex: number) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  reorderCertifications: (fromIndex: number, toIndex: number) => void;

  // Bulk reset
  resetResume: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────
function toggleIndex(list: number[], idx: number): number[] {
  if (list.includes(idx)) return list.filter((i) => i !== idx);
  return [...list, idx].sort((a, b) => a - b);
}

/** Moves the item at fromIndex to toIndex within an array (mutates a copy). */
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= arr.length || to >= arr.length || from === to) {
    return arr;
  }
  const next = [...arr];
  const [removed] = next.splice(from, 1);
  if (removed === undefined) return arr;
  next.splice(to, 0, removed);
  return next;
}

// ─── Zustand Store ──────────────────────────────────────────────────
export const useResumeStore = create<ResumeData & ResumeActions>()(
  subscribeWithSelector((set) => ({
    ...defaultResume,

    // ── Hydration ──────────────────────────────────────────────────
    hydrate: () => {
      const persisted = loadPersistedState();
      if (persisted) {
        set(persisted);
      }
    },

    // ── Basics ─────────────────────────────────────────────────────
    updateBasics: (patch) =>
      set((s) => ({ basics: { ...s.basics, ...patch } })),

    updateSettings: (patch) =>
      set((s) => ({ settings: { ...s.settings, ...patch } })),

    replaceResume: (data) => set(normalizeResumeData(data)),

    // ── Work Experience ────────────────────────────────────────────
    addWorkExperience: () =>
      set((s) => ({
        workExperience: [
          ...s.workExperience,
          {
            id: uid(),
            company: "",
            position: "",
            location: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            description: "",
            hiddenBulletIndices: [],
          },
        ],
      })),
    updateWorkExperience: (id, patch) =>
      set((s) => ({
        workExperience: s.workExperience.map((w) =>
          w.id === id ? { ...w, ...patch } : w
        ),
      })),
    removeWorkExperience: (id) =>
      set((s) => ({
        workExperience: s.workExperience.filter((w) => w.id !== id),
      })),
    toggleBulletVisibility: (id, index) =>
      set((s) => ({
        workExperience: s.workExperience.map((w) =>
          w.id === id
            ? { ...w, hiddenBulletIndices: toggleIndex(w.hiddenBulletIndices, index) }
            : w
        ),
      })),

    // ── Education ──────────────────────────────────────────────────
    addEducation: () =>
      set((s) => ({
        education: [
          ...s.education,
          {
            id: uid(),
            institution: "",
            degree: "",
            field: "",
            location: "",
            startDate: "",
            endDate: "",
            gpa: "",
            highlights: "",
            hiddenBulletIndices: [],
          },
        ],
      })),
    updateEducation: (id, patch) =>
      set((s) => ({
        education: s.education.map((e) =>
          e.id === id ? { ...e, ...patch } : e
        ),
      })),
    removeEducation: (id) =>
      set((s) => ({
        education: s.education.filter((e) => e.id !== id),
      })),
    toggleHighlightVisibility: (id, index) =>
      set((s) => ({
        education: s.education.map((e) =>
          e.id === id
            ? { ...e, hiddenBulletIndices: toggleIndex(e.hiddenBulletIndices, index) }
            : e
        ),
      })),

    // ── Skill Categories ───────────────────────────────────────────
    addSkillCategory: () =>
      set((s) => ({
        skillCategories: [
          ...s.skillCategories,
          { id: uid(), name: "", skills: "" },
        ],
      })),
    updateSkillCategory: (id, patch) =>
      set((s) => ({
        skillCategories: s.skillCategories.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      })),
    removeSkillCategory: (id) =>
      set((s) => ({
        skillCategories: s.skillCategories.filter((c) => c.id !== id),
      })),

    // ── Projects ───────────────────────────────────────────────────
    addProject: () =>
      set((s) => ({
        projects: [
          ...s.projects,
          {
            id: uid(),
            name: "",
            description: "",
            url: "",
            technologies: "",
            startDate: "",
            endDate: "",
            hiddenBulletIndices: [],
          },
        ],
      })),
    updateProject: (id, patch) =>
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      })),
    removeProject: (id) =>
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
      })),
    toggleProjectBulletVisibility: (id, index) =>
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id
            ? { ...p, hiddenBulletIndices: toggleIndex(p.hiddenBulletIndices, index) }
            : p
        ),
      })),

    // ── Certifications ─────────────────────────────────────────────
    addCertification: () =>
      set((s) => ({
        certifications: [
          ...s.certifications,
          {
            id: uid(),
            name: "",
            issuer: "",
            date: "",
            url: "",
            credentialId: "",
          },
        ],
      })),
    updateCertification: (id, patch) =>
      set((s) => ({
        certifications: s.certifications.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      })),
    removeCertification: (id) =>
      set((s) => ({
        certifications: s.certifications.filter((c) => c.id !== id),
      })),

    // ── Reorder (drag-and-drop) ─────────────────────────────────────
    reorderWorkExperience: (from, to) =>
      set((s) => ({ workExperience: arrayMove(s.workExperience, from, to) })),
    reorderEducation: (from, to) =>
      set((s) => ({ education: arrayMove(s.education, from, to) })),
    reorderSkillCategories: (from, to) =>
      set((s) => ({ skillCategories: arrayMove(s.skillCategories, from, to) })),
    reorderProjects: (from, to) =>
      set((s) => ({ projects: arrayMove(s.projects, from, to) })),
    reorderCertifications: (from, to) =>
      set((s) => ({ certifications: arrayMove(s.certifications, from, to) })),

    // ── Reset ──────────────────────────────────────────────────────
    resetResume: () => set({ ...defaultResume, basics: { ...defaultResume.basics }, settings: { ...defaultResume.settings } }),
  }))
);

// ─── localStorage sync subscriber ────────────────────────────────────
const SYNC_MAX_BYTES = 5 * 1024 * 1024;

if (typeof window !== "undefined") {
  useResumeStore.subscribe(
    (state) => ({
      basics: state.basics,
      workExperience: state.workExperience,
      education: state.education,
      skillCategories: state.skillCategories,
      projects: state.projects,
      certifications: state.certifications,
      settings: state.settings,
    }),
    (data) => {
      try {
        const json = JSON.stringify(data);
        if (json.length <= SYNC_MAX_BYTES) {
          localStorage.setItem(STORAGE_KEY, json);
        }
      } catch {
        // Silently fail on storage quota or private-mode errors
      }
    },
    { equalityFn: () => false }
  );
}
