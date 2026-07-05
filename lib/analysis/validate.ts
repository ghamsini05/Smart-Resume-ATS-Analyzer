import { isSectionHeader } from './sections';

export function validateInput(resume: string) {
  const resumeLower = resume.toLowerCase();

  // 1. Check if the resume is a Job Description
  const jdIndicators = [
    "we are looking for",
    "responsibilities",
    "requirements",
    "you will",
    "the ideal candidate",
    "apply now"
  ];

  let matchCount = 0;
  for (const indicator of jdIndicators) {
    if (resumeLower.includes(indicator)) {
      matchCount++;
    }
  }

  if (matchCount >= 2) {
    return {
      kind: 'resume-is-job-description' as const,
      message: "This looks like a job description, not a resume."
    };
  }

  // 2. Check if the input is not a resume at all
  const lines = resume.split('\n');
  const hasEmail = /@/.test(resume);
  const hasSectionHeader = lines.some(line => isSectionHeader(line));

  if (resume.length < 200 || !(hasEmail || hasSectionHeader)) {
    return {
      kind: 'not-a-resume' as const,
      message: "This doesn't look like a resume. Paste your full resume text."
    };
  }

  return null;
}
