export type Verdict = 'ready' | 'almost' | 'needs-work';

export interface AnalysisResult {
  composite: number;
  verdict: Verdict;
  prediction: {
    outcome: 'yes' | 'borderline' | 'no';
    reason: string;
  };
  matchScore: number;
  projAvg: number;
  formatScore: number;
  matched: string[];
  missing: string[];
  projects: {
    title: string;
    body: string;
    score: number;
    issues: string[];
    rewrite: string;
  }[];
  hasContact: boolean;
  hasSections: boolean;
  lifts: {
    desc: string;
    sub: string;
    gain: number;
  }[];
  inputWarning: {
    kind: 'resume-is-job-description' | 'not-a-resume';
    message: string;
  } | null;
}
