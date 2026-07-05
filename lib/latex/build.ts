import { TailoredResume } from '../../types/tailored';
import { toLatin1Safe } from '../text/sanitize';

export function escapeLatex(s: string): string {
  if (!s) return '';
  // Single-pass regex replacing \ { } $ & # % _ ~ ^ with their escaped LaTeX sequences
  return s.replace(/[\{\}\$\&\#\%_\~\^\\]/g, (match) => {
    switch (match) {
      case '\\': return '\\textbackslash{}';
      case '{': return '\\{';
      case '}': return '\\}';
      case '$': return '\\$';
      case '&': return '\\&';
      case '#': return '\\#';
      case '%': return '\\%';
      case '_': return '\\_';
      case '~': return '\\textasciitilde{}';
      case '^': return '\\textasciicircum{}';
      default: return match;
    }
  });
}

function clean(s: string): string {
  return escapeLatex(toLatin1Safe(s));
}

export function buildLatex(r: TailoredResume): string {
  const parts: string[] = [];

  // Header template
  parts.push('% --- Resume LaTeX Source ---');
  parts.push('\\documentclass[11pt,letterpaper]{article}');
  parts.push('\\usepackage[margin=0.75in]{geometry}');
  parts.push('\\usepackage[T1]{fontenc}');
  parts.push('\\usepackage[utf8]{inputenc}');
  parts.push('\\usepackage{lmodern}');
  parts.push('\\usepackage{parskip}');
  parts.push('\\usepackage{enumitem}');
  parts.push('\\usepackage{titlesec}');
  parts.push('\\usepackage[hidelinks]{hyperref}');
  parts.push('');
  parts.push('% Section styling');
  parts.push('\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]');
  parts.push('\\titlespacing*{\\section}{0pt}{10pt}{5pt}');
  parts.push('');
  parts.push('\\begin{document}');
  parts.push('\\pagestyle{empty}');
  parts.push('');

  // Title name
  parts.push('\\begin{center}');
  parts.push(`  {\\LARGE\\bfseries ${clean(r.name)}}\\\\`);
  parts.push('  \\vspace{4pt}');

  // Contact line
  const contactParts: string[] = [];
  if (r.contact.email) contactParts.push(clean(r.contact.email));
  if (r.contact.phone) contactParts.push(clean(r.contact.phone));
  if (r.contact.github) contactParts.push(`github.com/${clean(r.contact.github)}`);
  if (r.contact.linkedin) contactParts.push(`linkedin.com/in/${clean(r.contact.linkedin)}`);
  if (r.contact.website) contactParts.push(clean(r.contact.website));
  if (r.contact.location) contactParts.push(clean(r.contact.location));

  if (contactParts.length > 0) {
    parts.push(`  ${contactParts.join(' $\\vert$ ')}`);
  }
  parts.push('\\end{center}');
  parts.push('\\vspace{6pt}');

  // Summary
  if (r.summary) {
    parts.push('\\section*{SUMMARY}');
    parts.push(clean(r.summary));
    parts.push('');
  }

  // Skills
  if (r.skills && r.skills.length > 0) {
    parts.push('\\section*{SKILLS}');
    parts.push(clean(r.skills.join(', ')));
    parts.push('');
  }

  // Education
  if (r.education && r.education.length > 0) {
    parts.push('\\section*{EDUCATION}');
    for (const edu of r.education) {
      const degreeStr = clean(edu.degree);
      const schoolStr = clean(edu.school);
      const dateStr = edu.dates ? clean(edu.dates) : '';
      parts.push(`\\textbf{${degreeStr}} --- \\textbf{${schoolStr}} \\hfill ${dateStr}\\\\`);
      if (edu.details) {
        parts.push(`${clean(edu.details)}\\\\`);
      }
      parts.push('\\vspace{4pt}');
    }
    parts.push('');
  }

  // Experience
  if (r.experience && r.experience.length > 0) {
    parts.push('\\section*{EXPERIENCE}');
    for (const exp of r.experience) {
      const titleStr = clean(exp.title);
      const compStr = clean(exp.company);
      const dateStr = exp.dates ? clean(exp.dates) : '';
      parts.push(`\\textbf{${titleStr}} at \\textbf{${compStr}} \\hfill ${dateStr}`);
      parts.push('\\begin{itemize}[leftmargin=*,itemsep=2pt,parsep=0pt,topsep=4pt]');
      
      for (const bullet of exp.bullets) {
        let escapedBullet = clean(bullet);
        // Guard brackets at the start of bullet so \item doesn't read it as optional label
        if (escapedBullet.startsWith('[')) {
          escapedBullet = '{}' + escapedBullet;
        }
        parts.push(`  \\item ${escapedBullet}`);
      }
      
      parts.push('\\end{itemize}');
      parts.push('\\vspace{4pt}');
    }
    parts.push('');
  }

  // Projects
  if (r.projects && r.projects.length > 0) {
    parts.push('\\section*{PROJECTS}');
    for (const proj of r.projects) {
      parts.push(`\\textbf{${clean(proj.title)}}`);
      parts.push('\\begin{itemize}[leftmargin=*,itemsep=2pt,parsep=0pt,topsep=4pt]');

      for (const bullet of proj.bullets) {
        let escapedBullet = clean(bullet);
        // Guard brackets at the start of bullet
        if (escapedBullet.startsWith('[')) {
          escapedBullet = '{}' + escapedBullet;
        }
        parts.push(`  \\item ${escapedBullet}`);
      }

      parts.push('\\end{itemize}');
      parts.push('\\vspace{4pt}');
    }
    parts.push('');
  }

  parts.push('\\end{document}');

  return parts.join('\n');
}
