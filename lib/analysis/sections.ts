export const KNOWN_HEADERS = new Set([
  'summary',
  'education',
  'experience',
  'skills',
  'projects',
  'certifications',
  'awards',
  'languages',
  'interests',
  'profile',
  'contact',
  'objective',
  'publications',
  'work history',
  'employment',
  'technical skills',
  'professional experience'
]);

export function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;

  // Exact case-insensitive match for known headers
  if (KNOWN_HEADERS.has(trimmed.toLowerCase())) {
    return true;
  }

  // ALL-CAPS line of 3+ chars
  const hasLetters = /[a-zA-Z]/.test(trimmed);
  if (trimmed.length >= 3 && trimmed === trimmed.toUpperCase() && hasLetters) {
    return true;
  }

  return false;
}

export function extractProjectsSection(resume: string): string[] {
  const lines = resume.split('\n');
  let inProjectsSection = false;
  const projectLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inProjectsSection) {
      // Stop collecting if we encounter the next section header
      if (isSectionHeader(line)) {
        break;
      }
      projectLines.push(line);
    } else {
      if (/^projects?$/i.test(trimmed)) {
        inProjectsSection = true;
      }
    }
  }

  return projectLines;
}
