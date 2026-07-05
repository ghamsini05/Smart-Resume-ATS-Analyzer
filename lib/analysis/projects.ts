import { STRONG_VERBS, KNOWN_SKILLS, VAGUE_PHRASES } from '../data/lists';
import { matchesSkill } from './keywords';

function isMultiSentence(line: string): boolean {
  const trimmed = line.trim();
  // Check if there is a sentence delimiter (. ! ?) followed by whitespace and a capital letter
  return /[.!?]\s+[A-Z]/.test(trimmed);
}

interface RawProject {
  title: string;
  body: string;
}

export function splitProjects(lines: string[]): RawProject[] {
  const projects: RawProject[] = [];
  let currentProject: RawProject | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (currentProject) {
        projects.push(currentProject);
        currentProject = null;
      }
      continue;
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    // A line is a TITLE if:
    // 1. There is no current project
    // 2. It is < 60 characters
    // 3. It has <= 8 words
    // 4. It is not a full multi-sentence line
    const isTitle =
      !currentProject &&
      trimmed.length < 60 &&
      words.length <= 8 &&
      !isMultiSentence(trimmed);

    if (isTitle) {
      currentProject = {
        title: trimmed,
        body: ''
      };
    } else {
      if (!currentProject) {
        currentProject = {
          title: '',
          body: trimmed
        };
      } else {
        currentProject.body = currentProject.body
          ? currentProject.body + '\n' + trimmed
          : trimmed;
      }
    }
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  // Keep only projects whose body length > 10.
  return projects.filter(p => p.body.length > 10);
}

export function scoreProject(body: string) {
  let score = 100;
  const issues: string[] = [];

  // Rule 1: No STRONG_VERBS in body
  const hasStrongVerb = STRONG_VERBS.some(verb => matchesSkill(body, verb));
  if (!hasStrongVerb) {
    score -= 20;
    issues.push("Start with a strong action verb.");
  }

  // Rule 2: No digit and no "%" in body
  const hasQuantifier = /\d/.test(body) || body.includes('%');
  if (!hasQuantifier) {
    score -= 25;
    issues.push("Add a quantified result (numbers, %).");
  }

  // Rule 3: No KNOWN_SKILLS term in body
  const hasSkill = KNOWN_SKILLS.some(skill => matchesSkill(body, skill));
  if (!hasSkill) {
    score -= 20;
    issues.push("Name the technologies you used.");
  }

  // Rule 4: Any VAGUE_PHRASES present in body
  const hasVaguePhrase = VAGUE_PHRASES.some(phrase => matchesSkill(body, phrase));
  if (hasVaguePhrase) {
    score -= 15;
    issues.push("Replace vague phrasing with specifics.");
  }

  // Rule 5: Body length < 60
  if (body.length < 60) {
    score -= 20;
    issues.push("Add more detail.");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    rewrite: ""
  };
}

export function analyzeProjects(projectLines: string[]) {
  const rawProjects = splitProjects(projectLines);
  const projects = rawProjects.map(p => {
    const { score, issues, rewrite } = scoreProject(p.body);
    return {
      title: p.title,
      body: p.body,
      score,
      issues,
      rewrite
    };
  });

  const projAvg = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length)
    : 40;

  return {
    projects,
    projAvg
  };
}
