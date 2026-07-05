import { NextResponse } from 'next/server';
import { normalizeText } from '../../../lib/analysis/normalize';

export const runtime = 'nodejs';

// Polyfill Node.js environment with mock canvas globals required by pdf-parse / pdf.js initialization
if (typeof global !== 'undefined') {
  if (typeof (global as any).DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  if (typeof (global as any).ImageData === 'undefined') {
    (global as any).ImageData = class ImageData {};
  }
  if (typeof (global as any).Path2D === 'undefined') {
    (global as any).Path2D = class Path2D {};
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Size validation: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Extension validation: only .pdf/.docx
    const filename = file.name || '';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      return NextResponse.json({ error: 'Only .pdf and .docx file formats are supported' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    if (ext === 'pdf') {
      // Lazily require pdf-parse inside the handler
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      extractedText = parsed.text || '';
    } else {
      // Lazily require mammoth
      const mammoth = require('mammoth');
      const parsed = await mammoth.extractRawText({ buffer });
      extractedText = parsed.value || '';
    }

    const text = normalizeText(extractedText);

    // warning = "parser_garbled" if text < 200 chars OR no /(EDUCATION|PROJECTS|EXPERIENCE|SKILLS)/i match
    const hasCoreSections = /(EDUCATION|PROJECTS|EXPERIENCE|SKILLS)/i.test(text);
    const warning = (text.length < 200 || !hasCoreSections) ? 'parser_garbled' : undefined;

    return NextResponse.json({ text, warning });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    return NextResponse.json({ error: error?.message || 'Failed to parse resume file' }, { status: 500 });
  }
}
