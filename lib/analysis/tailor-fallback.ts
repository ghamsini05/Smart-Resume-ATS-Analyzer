import { TailoredResume } from '../../types/tailored';
import { KNOWN_SKILLS, STRONG_VERBS, VAGUE_PHRASES } from '../data/lists';
import { matchesSkill } from './keywords';
import { isSectionHeader } from './sections';

// Helper to determine if a line contains contact details
function isContactLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    /@/.test(trimmed) ||
    /\d{3}[-.\s]?\d{3}/.test(trimmed) ||
    /github\.com/i.test(trimmed) ||
    /linkedin\.com/i.test(trimmed) ||
    /https?:\/\//i.test(trimmed)
  );
}

// Helper to check if a project bullet is weak
function isWeakBullet(bullet: string): boolean {
  const hasStrongVerb = STRONG_VERBS.some(v => matchesSkill(bullet, v));
  const hasQuantifier = /\d/.test(bullet) || bullet.includes('%');
  const hasSkill = KNOWN_SKILLS.some(s => matchesSkill(bullet, s));
  const hasVaguePhrase = VAGUE_PHRASES.some(p => matchesSkill(bullet, p));
  const isShort = bullet.length < 60;

  return !hasStrongVerb || !hasQuantifier || !hasSkill || hasVaguePhrase || isShort;
}

// Helper to rewrite a project bullet into the XYZ format
function rewriteBullet(bullet: string): string {
  if (!isWeakBullet(bullet)) {
    return bullet;
  }

  const skillsFound = KNOWN_SKILLS.filter(s => matchesSkill(bullet, s));
  const lower = bullet.toLowerCase();

  const isFrontend = /front|ui|ux|react|angular|vue|svelte|css|html|sass|tailwind|bootstrap|figma|webpack|vite/i.test(lower);
  const isBackend = /back|api|database|db|sql|postgres|mysql|mongo|redis|node|express|django|flask|fastapi|graphql/i.test(lower);

  if (isFrontend) {
    const tech = skillsFound.length > 0 ? skillsFound.join(', ') : 'React';
    return `Optimized user interface features and styled components using ${tech}, resulting in a [number]% improvement in client-side performance.`;
  } else if (isBackend) {
    const tech = skillsFound.length > 0 ? skillsFound.join(', ') : 'Node.js and SQL';
    return `Engineered robust backend API endpoints and data schemas using ${tech}, reducing response latencies by [number]%.`;
  } else {
    const tech = skillsFound.length > 0 ? skillsFound.join(', ') : 'TypeScript';
    return `Architected system logic and streamlined integrations using ${tech}, delivering a [number]% boost in development cycle efficiency.`;
  }
}

export function deterministicTailor(resume: string, missingSkills: string[]): TailoredResume {
  const lines = resume.split('\n');

  // 1. Extract name (first non-empty, non-contact, non-header line)
  let name = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !isContactLine(line) && !isSectionHeader(line)) {
      name = trimmed;
      break;
    }
  }
  if (!name) name = 'Candidate Name';

  // 2. Extract contact details via regex
  const emailMatch = resume.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resume.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const githubMatch = resume.match(/(?:github\.com\/)([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = resume.match(/(?:linkedin\.com\/in\/)([a-zA-Z0-9_-]+)/i);
  const urls = resume.match(/https?:\/\/[^\s|]+/g) || [];
  const website = urls.find(url => !/github\.com|linkedin\.com/i.test(url));

  const contact = {
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    github: githubMatch ? githubMatch[1] : undefined,
    linkedin: linkedinMatch ? linkedinMatch[1] : undefined,
    website: website || undefined
  };

  // 3. Segment the resume into raw lines per section
  const sections: { [key: string]: string[] } = {
    summary: [],
    skills: [],
    education: [],
    projects: [],
    experience: []
  };

  let currentSection = 'summary';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    if (isSectionHeader(line)) {
      const lowerHeader = trimmed.toLowerCase();
      if (/education/i.test(lowerHeader)) {
        currentSection = 'education';
      } else if (/skills/i.test(lowerHeader)) {
        currentSection = 'skills';
      } else if (/projects?/i.test(lowerHeader)) {
        currentSection = 'projects';
      } else if (/experience|work|history|employment/i.test(lowerHeader)) {
        currentSection = 'experience';
      } else if (/summary|profile|objective/i.test(lowerHeader)) {
        currentSection = 'summary';
      }
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  // 4. Parse Summary
  const summary = sections.summary.length > 0 ? sections.summary.join(' ') : undefined;

  // 5. Parse Skills & inject missing keywords
  const parsedSkills: string[] = [];
  for (const line of sections.skills) {
    const tokens = line.split(/[;|,]/);
    for (const t of tokens) {
      const trimmed = t.trim();
      if (trimmed && trimmed.length < 30) {
        parsedSkills.push(trimmed);
      }
    }
  }
  // Inject missing keywords
  const skills = Array.from(new Set([...parsedSkills, ...missingSkills]));

  // 6. Parse Education
  const education: TailoredResume['education'] = [];
  if (sections.education.length > 0) {
    const blocks: string[][] = [];
    let currentBlock: string[] = [];
    for (const line of sections.education) {
      if (line.trim() === '') {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      } else {
        currentBlock.push(line.trim());
      }
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    for (const block of blocks) {
      const firstLine = block[0] || '';
      const secondLine = block[1] || '';
      const rest = block.slice(2).join(', ');

      const dateRegex = /\b(19|20)\d{2}\b/g;
      let dates: string | undefined;
      const dateMatches = firstLine.match(dateRegex) || secondLine.match(dateRegex);
      if (dateMatches) {
        dates = dateMatches.join(' - ');
      }

      let school = '';
      let degree = '';

      if (/university|college|institute|academy/i.test(firstLine)) {
        school = firstLine;
        degree = secondLine || 'Degree';
      } else if (/university|college|institute|academy/i.test(secondLine)) {
        school = secondLine;
        degree = firstLine || 'Degree';
      } else {
        school = firstLine || 'Institution';
        degree = secondLine || 'Degree';
      }

      education.push({
        degree,
        school,
        dates: dates || undefined,
        details: rest || undefined
      });
    }
  }

  // 7. Parse Projects
  const projects: TailoredResume['projects'] = [];
  let currentProj: { title: string; bullets: string[] } | null = null;

  for (const line of sections.projects) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    const isBullet = /^[-\*•]\s*/.test(trimmed);
    if (isBullet) {
      const bulletContent = trimmed.replace(/^[-\*•]\s*/, '');
      const rewritten = rewriteBullet(bulletContent);
      if (currentProj) {
        currentProj.bullets.push(rewritten);
      } else {
        currentProj = {
          title: 'Project Details',
          bullets: [rewritten]
        };
      }
    } else {
      if (currentProj) {
        projects.push(currentProj);
      }
      currentProj = {
        title: trimmed,
        bullets: []
      };
    }
  }
  if (currentProj) {
    projects.push(currentProj);
  }

  // 8. Parse Experience
  const experience: TailoredResume['experience'] = [];
  let currentExp: { title: string; company: string; dates?: string; bullets: string[] } | null = null;

  for (const line of sections.experience) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    const isBullet = /^[-\*•]\s*/.test(trimmed);
    if (isBullet) {
      const bulletContent = trimmed.replace(/^[-\*•]\s*/, '');
      if (currentExp) {
        currentExp.bullets.push(bulletContent);
      } else {
        currentExp = {
          title: 'Software Engineer',
          company: 'Company',
          bullets: [bulletContent]
        };
      }
    } else {
      if (currentExp) {
        experience.push(currentExp);
      }

      let title = 'Software Engineer';
      let company = 'Company';
      let dates: string | undefined;

      const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|\d{4})\b[-.\s\d\w\(\)]+/i;
      const dateMatch = trimmed.match(dateRegex);
      if (dateMatch) {
        dates = dateMatch[0].trim();
      }

      const cleanHeader = dates ? trimmed.replace(dates, '').replace(/,\s*$/, '').trim() : trimmed;

      if (/\b(?:at|for)\b/i.test(cleanHeader)) {
        const parts = cleanHeader.split(/\b(?:at|for)\b/i);
        title = parts[0]?.trim() || title;
        company = parts[1]?.trim() || company;
      } else if (cleanHeader.includes(',')) {
        const parts = cleanHeader.split(',');
        title = parts[0]?.trim() || title;
        company = parts[1]?.trim() || company;
      } else {
        title = cleanHeader;
      }

      currentExp = {
        title,
        company,
        dates: dates || undefined,
        bullets: []
      };
    }
  }
  if (currentExp) {
    experience.push(currentExp);
  }

  return {
    name,
    contact,
    summary,
    skills,
    education,
    projects,
    experience
  };
}
