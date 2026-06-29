// ─── Basics ───────────────────────────────────────────────────────────
export type ResumeDensityMode = "auto" | "compact" | "normal" | "spacious";

export interface ResumeBasics {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  websiteLabel: string;
  linkedin: string;
  linkedinLabel: string;
  github: string;
  githubLabel: string;
  summary: string;
  /** base64-encoded passport photo (35mm x 45mm aspect ratio) */
  passportPhotoUrl: string;
  /** Whether the saved passport photo is rendered on the resume. */
  includePassportPhoto: boolean;
  /** Preview/PDF photo scale multiplier. 1 = standard 35x45mm. */
  passportPhotoScale: number;
}

// ─── Work Experience ─────────────────────────────────────────────────
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;           // "present" or "YYYY-MM"
  isCurrent: boolean;
  description: string;       // newline-separated bullet points
  /** Indices of bullets to hide on the final resume */
  hiddenBulletIndices: number[];
}

// ─── Education ───────────────────────────────────────────────────────
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  highlights: string;        // newline-separated bullet points
  /** Indices of highlights to hide on the final resume */
  hiddenBulletIndices: number[];
}

// ─── Skills (categorized) ────────────────────────────────────────────
export interface SkillCategory {
  id: string;
  name: string;
  skills: string;            // comma-separated or individual entries
}

// ─── Projects ────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  description: string;       // newline-separated bullets
  url: string;
  technologies: string;      // comma-separated
  startDate: string;
  endDate: string;
  hiddenBulletIndices: number[];
}

// ─── Certifications ──────────────────────────────────────────────────
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
  credentialId: string;
}

// ─── Resume Settings ────────────────────────────────────────────────
export interface ResumeSettings {
  /** Auto keeps the current dynamic behavior; manual modes let users bias spacing. */
  densityMode: ResumeDensityMode;
  /** When true, the preview/export scales dense content down to fit one A4 page. */
  forceOnePage: boolean;
}

// ─── Full Resume State ──────────────────────────────────────────────
export interface ResumeData {
  basics: ResumeBasics;
  workExperience: WorkExperience[];
  education: Education[];
  skillCategories: SkillCategory[];
  projects: Project[];
  certifications: Certification[];
  settings: ResumeSettings;
}
