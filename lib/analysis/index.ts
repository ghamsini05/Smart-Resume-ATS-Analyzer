import { normalizeText } from './normalize';
import { validateInput } from './validate';
import { analyzeKeywords } from './keywords';
import { extractProjectsSection } from './sections';
import { analyzeProjects } from './projects';
import { analyzeFormat } from './format';
import { calculateCompositeAndVerdict } from './composite';
import { getPrediction } from './prediction';
import { generateLifts } from './lifts';
import { AnalysisResult } from '../../types/analysis';

export function runAnalysis(resumeRaw: string, jdRaw: string): AnalysisResult {
  // Normalize both resume and job description
  const resume = normalizeText(resumeRaw);
  const jd = normalizeText(jdRaw);

  // Validate the normalized resume
  const inputWarning = validateInput(resume);

  // Run the sub-analyses
  const keywordRes = analyzeKeywords(resume, jd);
  const projectLines = extractProjectsSection(resume);
  const projectRes = analyzeProjects(projectLines);
  const formatRes = analyzeFormat(resume);

  // Calculate composite score and verdict
  const { composite, verdict } = calculateCompositeAndVerdict(
    keywordRes.matchScore,
    projectRes.projAvg,
    formatRes.formatScore
  );

  // Generate prediction outcome and reason
  const prediction = getPrediction(composite, keywordRes.missing.length);

  // Generate actionable lifts sorted by gain
  const lifts = generateLifts(
    keywordRes.missing,
    projectRes.projects,
    formatRes.hasContact
  );

  return {
    composite,
    verdict,
    prediction,
    matchScore: keywordRes.matchScore,
    projAvg: projectRes.projAvg,
    formatScore: formatRes.formatScore,
    matched: keywordRes.matched,
    missing: keywordRes.missing,
    projects: projectRes.projects,
    hasContact: formatRes.hasContact,
    hasSections: formatRes.hasSections,
    lifts,
    inputWarning
  };
}
