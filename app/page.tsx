'use client';

import React, { useState, useRef } from 'react';
import InputForm from '../components/InputForm';
import ScoreCard from '../components/ScoreCard';
import TailorCTA from '../components/TailorCTA';
import { AnalysisResult } from '../types/analysis';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [scannedResume, setScannedResume] = useState('');
  const [scannedJd, setScannedJd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (resume: string, jd: string) => {
    setIsLoading(true);
    setError(null);
    setScannedResume(resume);
    setScannedJd(jd);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume, jd }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze inputs');
      }

      setResult(data);
      
      // Smooth scroll to results after a short delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.07] pointer-events-none" />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[400px] right-[10%] w-[300px] h-[300px] bg-fuchsia-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-violet-800/40 bg-violet-950/20 text-xs font-semibold text-violet-400 tracking-wider uppercase">
            ⚡ Phase 1 Engine Active
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Resume ATS Smart Scanner
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Instantly benchmark your resume against any target job description. Optimize keyword alignment, reinforce project accomplishments, and clean up style issues to pass automated hiring screeners.
          </p>
        </header>

        {/* Input Form Box */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-t-2xl" />
          <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Error Banner */}
        {error && (
          <div className="max-w-4xl mx-auto p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-300 text-sm leading-relaxed text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Results Showcase Section */}
        {result && (
          <div ref={resultsRef} className="pt-8 border-t border-zinc-900/80 scroll-mt-6 space-y-12">
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-center text-zinc-100 mb-8 tracking-wide">
                Scan Results & Optimizations
              </h2>
              <ScoreCard result={result} />
            </div>

            {!result.inputWarning && (
              <div className="pt-8 border-t border-zinc-900/60">
                <TailorCTA resume={scannedResume} jd={scannedJd} />
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900/60 py-6 text-center text-xs text-zinc-600 bg-zinc-950/80">
        <p>© 2026 Resume ATS Checker. Powered by local parsing & TypeScript analysis.</p>
      </footer>
    </div>
  );
}
