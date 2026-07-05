import { TailoredResume } from '../../types/tailored';

export function tailoredToText(r: TailoredResume): string {
  const parts: string[] = [];

  // Header: Name
  parts.push(r.name);

  // Contact info row
  const contactParts: string[] = [];
  if (r.contact.email) contactParts.push(r.contact.email);
  if (r.contact.phone) contactParts.push(r.contact.phone);
  if (r.contact.github) contactParts.push(`github.com/${r.contact.github}`);
  if (r.contact.linkedin) contactParts.push(`linkedin.com/in/${r.contact.linkedin}`);
  if (r.contact.website) contactParts.push(r.contact.website);
  if (r.contact.location) contactParts.push(r.contact.location);

  if (contactParts.length > 0) {
    parts.push(contactParts.join(' | '));
  }
  parts.push(''); // blank line

  // Summary
  if (r.summary) {
    parts.push('SUMMARY');
    parts.push(r.summary);
    parts.push('');
  }

  // Skills
  if (r.skills && r.skills.length > 0) {
    parts.push('SKILLS');
    parts.push(r.skills.join(', '));
    parts.push('');
  }

  // Education
  if (r.education && r.education.length > 0) {
    parts.push('EDUCATION');
    for (const edu of r.education) {
      let eduLine = `${edu.degree} - ${edu.school}`;
      if (edu.dates) eduLine += ` (${edu.dates})`;
      parts.push(eduLine);
      if (edu.details) parts.push(edu.details);
      parts.push('');
    }
  }

  // Experience
  if (r.experience && r.experience.length > 0) {
    parts.push('EXPERIENCE');
    for (const exp of r.experience) {
      let expHeader = `${exp.title} at ${exp.company}`;
      if (exp.dates) expHeader += ` (${exp.dates})`;
      parts.push(expHeader);
      for (const bullet of exp.bullets) {
        parts.push(`- ${bullet}`);
      }
      parts.push('');
    }
  }

  // Projects
  if (r.projects && r.projects.length > 0) {
    parts.push('PROJECTS');
    for (const proj of r.projects) {
      parts.push(proj.title);
      for (const bullet of proj.bullets) {
        parts.push(`- ${bullet}`);
      }
      parts.push('');
    }
  }

  return parts.join('\n').trim();
}

export function countPlaceholders(r: TailoredResume): number {
  let combinedText = '';

  if (r.summary) {
    combinedText += r.summary + ' ';
  }

  if (r.experience) {
    for (const exp of r.experience) {
      combinedText += exp.bullets.join(' ') + ' ';
    }
  }

  if (r.projects) {
    for (const proj of r.projects) {
      combinedText += proj.bullets.join(' ') + ' ';
    }
  }

  // Matches [anything inside square brackets]
  const matches = combinedText.match(/\[[^\]]+\]/g);
  return matches ? matches.length : 0;
}
