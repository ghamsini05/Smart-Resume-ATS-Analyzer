export interface TailoredResume {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    website?: string;
    location?: string;
  };
  summary?: string;
  skills: string[];
  education: {
    degree: string;
    school: string;
    dates?: string;
    details?: string;
  }[];
  projects: {
    title: string;
    bullets: string[];
  }[];
  experience: {
    title: string;
    company: string;
    dates?: string;
    bullets: string[];
  }[];
}

export interface TailorScore {
  composite: number;
  matchScore: number;
  projAvg: number;
  formatScore: number;
  matchedCount: number;
  missingCount: number;
}

export interface TailorResponse {
  mode: 'llm' | 'fallback';
  tailored: TailoredResume;
  filenameBase: string;
  exports: {
    docxBase64: string | null;
    pdfBase64: string | null;
    latex: string | null;
  };
  placeholders: number;
  before: TailorScore;
  after: TailorScore;
}
