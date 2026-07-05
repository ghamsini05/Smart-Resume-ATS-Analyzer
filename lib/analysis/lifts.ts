interface ProjectInput {
  title: string;
  score: number;
  issues: string[];
}

export function generateLifts(
  missing: string[],
  projects: ProjectInput[],
  hasContact: boolean
) {
  const lifts: { desc: string; sub: string; gain: number }[] = [];

  // Rule 1: If missing keywords exist
  if (missing.length > 0) {
    lifts.push({
      desc: "Add missing keywords",
      sub: missing.slice(0, 5).join(", "),
      gain: 12
    });
  }

  // Rule 2: For each project with score < 80
  for (const proj of projects) {
    if (proj.score < 80) {
      lifts.push({
        desc: `Strengthen "${proj.title || 'Project'}"`,
        sub: proj.issues[0] || "Improve project metrics.",
        gain: 8
      });
    }
  }

  // Rule 3: If contact info is missing
  if (!hasContact) {
    lifts.push({
      desc: "Add contact info",
      sub: "Include email and phone",
      gain: 10
    });
  }

  // Sort by gain descending
  return lifts.sort((a, b) => b.gain - a.gain);
}
