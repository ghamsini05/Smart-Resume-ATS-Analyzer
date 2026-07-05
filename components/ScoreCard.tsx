import React from 'react';
import { AnalysisResult } from '../types/analysis';

interface ScoreCardProps {
  result: AnalysisResult;
}

export default function ScoreCard({ result }: ScoreCardProps) {
  const {
    composite,
    verdict,
    prediction,
    matchScore,
    projAvg,
    formatScore,
    matched,
    missing,
    projects,
    lifts,
    inputWarning
  } = result;

  // Render inputWarning banner if it exists
  if (inputWarning) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-900/60 shadow-2xl text-zinc-100 space-y-4 max-w-4xl mx-auto backdrop-blur-md animate-fade-in">
        <div className="flex items-center space-x-3 text-rose-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold uppercase tracking-wider">Analysis Warning</h3>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{inputWarning.message}</p>
        <div className="text-xs text-zinc-500 italic mt-2">
          Note: This checker evaluates typical resume formats. Please verify that your input matches standard layouts.
        </div>
      </div>
    );
  }

  // Verdict pill configuration
  const verdictConfig = {
    'ready': {
      label: 'ATS READY',
      pillClass: 'text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      textClass: 'text-emerald-400',
      circleColor: 'stroke-emerald-500',
    },
    'almost': {
      label: 'ALMOST READY',
      pillClass: 'text-amber-400 bg-amber-950/30 border border-amber-800/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      textClass: 'text-amber-400',
      circleColor: 'stroke-amber-500',
    },
    'needs-work': {
      label: 'NEEDS WORK',
      pillClass: 'text-rose-400 bg-rose-950/30 border border-rose-800/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
      textClass: 'text-rose-400',
      circleColor: 'stroke-rose-500',
    }
  };

  const currentVerdict = verdictConfig[verdict] || verdictConfig['needs-work'];

  // Points to clear 80 bar
  const pointsTo80 = 80 - composite;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Section: Composite Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Composite Score Circle Gauge */}
        <div className="md:col-span-1 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-6 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
          <h4 className="text-zinc-400 text-xs font-semibold tracking-wider uppercase mb-4">ATS Compatibility</h4>
          
          <div className="relative flex items-center justify-center h-36 w-36 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-zinc-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className={`transition-all duration-1000 ease-out ${currentVerdict.circleColor}`}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * Math.min(100, Math.max(0, composite))) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-zinc-100">{composite}</span>
              <span className="text-xxs text-zinc-500 uppercase tracking-widest mt-0.5">/ 100</span>
            </div>
          </div>

          <div className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider mb-3 ${currentVerdict.pillClass}`}>
            {currentVerdict.label}
          </div>

          <div className="text-xs font-medium text-zinc-400">
            {pointsTo80 > 0 ? (
              <span className="text-violet-400">+{pointsTo80} points to clear the 80 bar</span>
            ) : (
              <span className="text-emerald-400">✓ Target score met!</span>
            )}
          </div>
        </div>

        {/* Prediction and Breakdown */}
        <div className="md:col-span-2 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-pink-600" />
          
          {/* Prediction Box */}
          <div className="space-y-3">
            <h4 className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">Scanned Summary</h4>
            <div className="flex items-start space-x-3">
              <span className={`text-2xl mt-1 leading-none ${prediction.outcome === 'yes' ? 'text-emerald-400' : prediction.outcome === 'borderline' ? 'text-amber-400' : 'text-rose-400'}`}>
                {prediction.outcome === 'yes' ? '🟢' : prediction.outcome === 'borderline' ? '🟡' : '🔴'}
              </span>
              <div>
                <p className="text-zinc-200 text-sm font-medium leading-relaxed">
                  Prediction: <span className="font-bold capitalize">{prediction.outcome}</span>
                </p>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{prediction.reason}</p>
              </div>
            </div>
          </div>

          {/* Subscores breakdown */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-900 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-200">{matchScore}</div>
              <div className="text-xxs text-zinc-500 uppercase tracking-widest mt-1">Keywords (45%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-200">{projAvg}</div>
              <div className="text-xxs text-zinc-500 uppercase tracking-widest mt-1">Projects (35%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-200">{formatScore}</div>
              <div className="text-xxs text-zinc-500 uppercase tracking-widest mt-1">Format (20%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Keywords Analysis (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Keyword Matching Card */}
          <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-6 backdrop-blur-md shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-900">
              <h3 className="text-md font-bold text-zinc-100 tracking-wide">Target Keyword Match</h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-900 text-zinc-400 rounded-lg border border-zinc-800">
                Score: {matchScore}/100
              </span>
            </div>

            <div className="space-y-6">
              {/* Matched Keywords */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="text-sm">✓</span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Matched Keywords ({matched.length})</h4>
                </div>
                {matched.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matched.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No matching keywords found.</p>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-900/60">
                <div className="flex items-center space-x-2 text-rose-400">
                  <span className="text-sm">✗</span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Missing Keywords ({missing.length})</h4>
                </div>
                {missing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missing.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No missing keywords! You matched all keywords found in the JD.</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Details Cards */}
          <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-6 backdrop-blur-md shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-900">
              <h3 className="text-md font-bold text-zinc-100 tracking-wide">Project Descriptions Analysis</h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-900 text-zinc-400 rounded-lg border border-zinc-800">
                Avg Score: {projAvg}/100
              </span>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-zinc-200">
                        {proj.title ? proj.title : `Project ${idx + 1}`}
                      </h4>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                        proj.score >= 80 
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40' 
                          : proj.score >= 60 
                            ? 'text-amber-400 bg-amber-950/20 border-amber-900/40' 
                            : 'text-rose-400 bg-rose-950/20 border-rose-900/40'
                      }`}>
                        {proj.score}/100
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-3 bg-zinc-950/20 p-2.5 rounded border border-zinc-900 font-mono leading-relaxed break-words whitespace-pre-wrap">
                      {proj.body}
                    </p>

                    {proj.issues.length > 0 ? (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-xxs text-zinc-500 uppercase tracking-wider block font-semibold">Identified Issues:</span>
                        <ul className="space-y-1">
                          {proj.issues.map((issue, issueIdx) => (
                            <li key={issueIdx} className="text-xs text-rose-300 flex items-start space-x-1.5">
                              <span className="text-rose-400 mt-0.5">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 font-medium">
                        ✓ Excellent project description structure!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No distinct project section was identified in your resume. Add a "Projects" section with detail to receive structured scoring feedback.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Score Lifts (col-span-1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-600 to-violet-600" />
            <h3 className="text-md font-bold text-zinc-100 tracking-wide mb-6 pb-4 border-b border-zinc-900">
              High Impact Improvements
            </h3>

            {lifts.length > 0 ? (
              <div className="space-y-4">
                {lifts.map((lift, idx) => (
                  <div key={idx} className="group relative p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 hover:border-violet-500/50 hover:bg-zinc-900/50 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-violet-400 transition-colors duration-200">
                          {lift.desc}
                        </h4>
                        <p className="text-xxs text-zinc-400 leading-normal max-w-[180px] break-words">
                          {lift.sub}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-900/40 whitespace-nowrap shadow-sm">
                        +{lift.gain} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-xs">
                Your resume is highly optimized! No score lifts available.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
