import { NextResponse } from 'next/server';
import { runAnalysis } from '../../../lib/analysis';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume, jd } = body;

    if (resume === undefined || jd === undefined) {
      return NextResponse.json({ error: 'Missing resume or jd in request body' }, { status: 400 });
    }

    const result = runAnalysis(String(resume), String(jd));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error during analysis:', error);
    return NextResponse.json({ error: error?.message || 'Failed to perform analysis' }, { status: 500 });
  }
}
