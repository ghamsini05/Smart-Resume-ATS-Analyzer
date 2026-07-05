'use client';

import React, { useState, useRef } from 'react';
import { TailorResponse } from '../types/tailored';
import { tailoredToText } from '../lib/tailor/serialize';

interface TailorCTAProps {
  resume: string;
  jd: string;
}

export default function TailorCTA({ resume, jd }: TailorCTAProps) {
  const [tailorData, setTailorData] = useState<TailorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleTailor = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume, jd }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to tailor resume');
      }

      setTailorData(data);

      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error tailoring resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Base64 download handler using direct data URL
  const downloadFile = (base64Str: string | null, filename: string, mime: string) => {
    if (!base64Str) {
      alert('File export is not available for this format.');
      return;
    }

    try {
      const a = document.createElement('a');
      a.href = `data:${mime};base64,${base64Str}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Defer DOM removal to allow Chrome to process the download properties
      setTimeout(() => {
        document.body.removeChild(a);
      }, 150);
    } catch (err) {
      console.error('Trigger download failed:', err);
      alert('Unable to process file download.');
    }
  };

  // Overleaf Post form submission
  const openInOverleaf = (latexStr: string | null) => {
    if (!latexStr) {
      alert('LaTeX source is not available.');
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';

    const encodedSnipInput = document.createElement('input');
    encodedSnipInput.type = 'hidden';
    encodedSnipInput.name = 'encoded_snip';
    encodedSnipInput.value = encodeURIComponent(latexStr);

    const engineInput = document.createElement('input');
    engineInput.type = 'hidden';
    engineInput.name = 'engine';
    engineInput.value = 'pdflatex';

    form.appendChild(encodedSnipInput);
    form.appendChild(engineInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  // LaTeX text file download helper
  const downloadLatexFile = (latexStr: string | null, filename: string) => {
    if (!latexStr) return;
    const blob = new Blob([latexStr], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Defer DOM removal to allow Chrome to process the download properties
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);
  };

  // Render text highlighting bracketed placeholder tokens [number], [company], etc.
  const renderPreviewWithHighlights = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <mark
            key={idx}
            className="bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded px-1 py-0.5 mx-0.5 font-bold animate-pulse"
          >
            {part}
          </mark>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Scan CTA button if not scanned yet */}
      {!tailorData && (
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/30 border border-zinc-800/80 rounded-2xl max-w-2xl mx-auto shadow-lg text-center space-y-4 backdrop-blur-md">
          <div className="text-3xl">✨</div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100">Need immediate keyword tailoring?</h3>
            <p className="text-zinc-400 text-xs max-w-md">
              Let the scan engine rewrite weak bullets into metric-based XYZ structures, inject missing keywords, and format everything into dynamic resume documents.
            </p>
          </div>
          <button
            onClick={handleTailor}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Rewriting & Matching...</span>
              </>
            ) : (
              <span>Tailor my resume</span>
            )}
          </button>

          {error && (
            <p className="text-xs text-rose-400 mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Tailor Results Box */}
      {tailorData && (
        <div ref={previewRef} className="space-y-8 animate-fade-in scroll-mt-6">
          
          {/* Header Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Projected Score comparison card */}
            <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-6 flex flex-col justify-center text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
              <span className="text-xxs font-semibold uppercase tracking-widest text-zinc-500">Projected ATS Score</span>
              
              <div className="flex items-center justify-center space-x-4 my-4">
                <span className="text-2xl font-semibold text-zinc-500 line-through">{tailorData.before.composite}</span>
                <span className="text-3xl text-zinc-400">→</span>
                <span className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {tailorData.after.composite}
                </span>
              </div>
              
              <span className="text-xxs text-zinc-400 font-semibold px-2.5 py-1 bg-zinc-900 border border-zinc-800/60 rounded-full inline-block mx-auto uppercase">
                {tailorData.mode === 'llm' ? '🤖 Groq Llama Rewriter' : '⚙️ Fallback Engine'}
              </span>
            </div>

            {/* Keyword Details & placeholder card */}
            <div className="md:col-span-2 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-pink-600" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scoring Breakdown</h4>
                  <span className="text-xxs text-emerald-400 font-semibold">Ready Target: 80+</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-zinc-500 text-xxs block uppercase">Keywords</span>
                    <span className="text-sm font-bold text-zinc-200">{tailorData.before.matchScore} → {tailorData.after.matchScore}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xxs block uppercase">Projects</span>
                    <span className="text-sm font-bold text-zinc-200">{tailorData.before.projAvg} → {tailorData.after.projAvg}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xxs block uppercase">Matched Skills</span>
                    <span className="text-sm font-bold text-zinc-200">{tailorData.before.matchedCount} → {tailorData.after.matchedCount}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xxs block uppercase">Remaining</span>
                    <span className="text-sm font-bold text-zinc-200">{tailorData.before.missingCount} → {tailorData.after.missingCount}</span>
                  </div>
                </div>

                {tailorData.placeholders > 0 ? (
                  <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-amber-300 text-xxs leading-relaxed">
                    📝 Found <strong className="font-bold">{tailorData.placeholders}</strong> bracketed placeholders (like <strong className="font-bold">[number]</strong>). Highlighted in gold below, fill them in before submitting to employers!
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-300 text-xxs leading-relaxed">
                    ✓ All placeholders populated. No placeholder bracket tokens found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Download & Overleaf Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl shadow-md">
            <button
              onClick={() => downloadFile(tailorData.exports.docxBase64, `${tailorData.filenameBase}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
              className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl border border-zinc-700 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>📄 Word (.docx)</span>
            </button>

            <button
              onClick={() => downloadFile(tailorData.exports.pdfBase64, `${tailorData.filenameBase}.pdf`, 'application/pdf')}
              className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl border border-zinc-700 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>📕 PDF (.pdf)</span>
            </button>

            <button
              onClick={() => openInOverleaf(tailorData.exports.latex)}
              className="px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md shadow-violet-900/20 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>🍃 Open in Overleaf</span>
            </button>

            <button
              onClick={() => downloadLatexFile(tailorData.exports.latex, `${tailorData.filenameBase}.tex`)}
              className="text-xxs text-violet-400 hover:text-violet-300 font-medium underline underline-offset-4 cursor-pointer"
            >
              Download LaTeX (.tex)
            </button>
          </div>

          {/* Tailored Resume Live Code Preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider px-1">Optimized Resume Preview</h3>
            <div className="w-full max-h-[500px] overflow-y-auto p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-300 leading-relaxed shadow-inner break-words whitespace-pre-wrap select-text">
              {renderPreviewWithHighlights(tailoredToText(tailorData.tailored))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
