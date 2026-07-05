import { NextResponse } from 'next/server';
import { tailorResumeWithLLM } from '../../../lib/llm/tailor-resume';
import { deterministicTailor } from '../../../lib/analysis/tailor-fallback';
import { runAnalysis } from '../../../lib/analysis';
import { analyzeKeywords } from '../../../lib/analysis/keywords';
import { normalizeText } from '../../../lib/analysis/normalize';
import { countPlaceholders, tailoredToText } from '../../../lib/tailor/serialize';
import { buildDocx } from '../../../lib/docx/build';
import { buildPdf } from '../../../lib/pdf/build';
import { buildLatex } from '../../../lib/latex/build';
import { TailorResponse } from '../../../types/tailored';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume, jd } = body;

    if (!resume || !jd) {
      return NextResponse.json({ error: 'Missing resume or jd in request body' }, { status: 400 });
    }

    const normalizedResume = normalizeText(resume);
    const normalizedJd = normalizeText(jd);

    // 1. Run analysis BEFORE tailoring
    const resBefore = runAnalysis(normalizedResume, normalizedJd);

    // 2. Perform tailoring (LLM or fallback)
    let tailored = await tailorResumeWithLLM(normalizedResume, normalizedJd);
    let mode: 'llm' | 'fallback' = 'llm';

    if (!tailored) {
      mode = 'fallback';
      const kwRes = analyzeKeywords(normalizedResume, normalizedJd);
      tailored = deterministicTailor(normalizedResume, kwRes.missing);
    }

    // 3. Build exports individually with try-catch blocks
    let docxBase64: string | null = null;
    try {
      const docxBuf = await buildDocx(tailored);
      docxBase64 = docxBuf.toString('base64');
    } catch (err) {
      console.error('Word export failed:', err);
    }

    let pdfBase64: string | null = null;
    try {
      const pdfBuf = await buildPdf(tailored);
      pdfBase64 = pdfBuf.toString('base64');
    } catch (err) {
      console.error('PDF export failed:', err);
    }

    let latex: string | null = null;
    try {
      latex = buildLatex(tailored);
    } catch (err) {
      console.error('LaTeX export failed:', err);
    }

    // 4. Run analysis AFTER tailoring
    const tailoredText = tailoredToText(tailored);
    const resAfter = runAnalysis(tailoredText, normalizedJd);

    // 5. Compute metadata
    const sanitizedName = tailored.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filenameBase = `${sanitizedName || 'resume'}_tailored`;

    const placeholders = countPlaceholders(tailored);

    const before = {
      composite: resBefore.composite,
      matchScore: resBefore.matchScore,
      projAvg: resBefore.projAvg,
      formatScore: resBefore.formatScore,
      matchedCount: resBefore.matched.length,
      missingCount: resBefore.missing.length
    };

    const after = {
      composite: resAfter.composite,
      matchScore: resAfter.matchScore,
      projAvg: resAfter.projAvg,
      formatScore: resAfter.formatScore,
      matchedCount: resAfter.matched.length,
      missingCount: resAfter.missing.length
    };

    const response: TailorResponse = {
      mode,
      tailored,
      filenameBase,
      exports: {
        docxBase64,
        pdfBase64,
        latex
      },
      placeholders,
      before,
      after
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in tailor API route:', error);
    return NextResponse.json({ error: error?.message || 'Failed to tailor resume' }, { status: 500 });
  }
}
