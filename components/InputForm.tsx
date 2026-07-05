'use client';

import React, { useState, useRef } from 'react';

interface InputFormProps {
  onAnalyze: (resume: string, jd: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onAnalyze, isLoading }: InputFormProps) {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset warnings and errors
    setError(null);
    setParseWarning(null);
    setFileName(file.name);
    setIsParsing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse the file');
      }

      setResume(data.text);
      if (data.warning === 'parser_garbled') {
        setParseWarning(
          "We parsed the document, but it looks like it might contain garbled characters or is missing core sections (Education, Projects, Experience, Skills). Please verify the extracted text below."
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to upload and parse file. Please copy-paste the text manually.');
      setFileName(null);
    } finally {
      setIsParsing(false);
      // Reset input value so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim()) {
      setError('Please provide your resume text or upload a document.');
      return;
    }
    if (!jd.trim()) {
      setError('Please provide the job description.');
      return;
    }
    setError(null);
    onAnalyze(resume, jd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Input Area */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-zinc-300">Your Resume</label>
            <div className="flex items-center space-x-2">
              {fileName && (
                <span className="text-xs text-zinc-400 max-w-[150px] truncate" title={fileName}>
                  📄 {fileName}
                </span>
              )}
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isParsing || isLoading}
                className="px-3 py-1.5 text-xs font-medium text-violet-400 border border-violet-800/60 rounded-lg hover:bg-violet-950/30 hover:border-violet-500 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isParsing ? 'Parsing Document...' : 'Upload PDF / DOCX'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden"
              />
            </div>
          </div>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your full resume here or upload a document..."
            className="h-96 w-full p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-zinc-200 placeholder-zinc-500 resize-none font-sans text-sm outline-none transition-all duration-200"
          />
        </div>

        {/* Job Description Input Area */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-zinc-300">Job Description</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the target job description here..."
            className="h-96 w-full p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-zinc-200 placeholder-zinc-500 resize-none font-sans text-sm outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Warnings & Errors */}
      {parseWarning && (
        <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-xl text-amber-300 text-xs leading-relaxed">
          ⚠️ {parseWarning}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-300 text-xs leading-relaxed animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading || isParsing}
          className="w-full md:w-64 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Scan & Analyze Resume</span>
          )}
        </button>
      </div>
    </form>
  );
}
