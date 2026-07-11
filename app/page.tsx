'use client';

import React, { useState, useRef } from 'react';
import InputForm from '../components/InputForm';
import ScoreCard from '../components/ScoreCard';
import { AnalysisResult } from '../types/analysis';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (resume: string, jd: string) => {
    setIsLoading(true);
    setError(null);

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
    <div className="min-h-screen bg-beige-200 text-beige-900 flex flex-col justify-between selection:bg-violet-200 selection:text-violet-900">
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d6ccb9_1px,transparent_1px),linear-gradient(to_bottom,#d6ccb9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[400px] right-[10%] w-[300px] h-[300px] bg-fuchsia-600/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-xs font-semibold text-violet-600 tracking-wider uppercase">
            ⚡ Phase 1 Engine Active
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-beige-900 via-stone-850 to-stone-700 bg-clip-text text-transparent">
            Resume ATS Smart Scanner
          </h1>
          <p className="text-beige-muted text-sm sm:text-base leading-relaxed">
            Instantly benchmark your resume against any target job description. Optimize keyword alignment, reinforce project accomplishments, and clean up style issues to pass automated hiring screeners.
          </p>
        </header>

        {/* Input Form Box */}
        <section className="bg-white/80 border border-beige-300/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-t-2xl" />
          <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Error Banner */}
        {error && (
          <div className="max-w-4xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm leading-relaxed text-center shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results Showcase Section */}
        {result && (
          <div ref={resultsRef} className="pt-8 border-t border-beige-300 scroll-mt-6 space-y-12">
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-center text-beige-900 mb-8 tracking-wide">
                Scan Results & Optimizations
              </h2>
              <ScoreCard result={result} />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-beige-300 py-6 text-center text-xs text-beige-muted bg-beige-50/80 backdrop-blur-sm">
        <p>© 2026 Resume ATS Checker. Powered by local parsing & TypeScript analysis.</p>
      </footer>
    </div>
  );
}
