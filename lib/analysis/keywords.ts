import { KNOWN_SKILLS } from '../data/lists';

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchesSkill(text: string, skill: string): boolean {
  const escaped = escapeRegExp(skill);
  // Use negative lookbehind (?<!\w) and negative lookahead (?!\w)
  // to ensure the skill matches as a whole token (not embedded in other letters/numbers)
  // even if it has regex special characters like c++, c#, or node.js.
  const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'i');
  return regex.test(text);
}

export function analyzeKeywords(resume: string, jd: string) {
  const required: string[] = [];
  const matched: string[] = [];

  for (const skill of KNOWN_SKILLS) {
    if (matchesSkill(jd, skill)) {
      required.push(skill);
      if (matchesSkill(resume, skill)) {
        matched.push(skill);
      }
    }
  }

  const missing = required.filter(s => !matched.includes(s));
  const matchScore = required.length === 0 ? 60 : Math.round((matched.length / required.length) * 100);

  return {
    required,
    matched,
    missing,
    matchScore
  };
}
