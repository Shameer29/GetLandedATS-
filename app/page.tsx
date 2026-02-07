'use client';

import { useState, useCallback } from 'react';
import { PiUploadSimple, PiFileText, PiCheckCircle, PiXCircle, PiWarningCircle, PiStrategy, PiLightning, PiTarget } from 'react-icons/pi';
import ResultsDashboard from '@/components/ResultsDashboard';
import type { ATSAnalysisResult } from '@/lib/ats-engine';

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);

  const analysisSteps = [
    { label: 'Parsing Document', sublabel: 'Extracting content' },
    { label: 'Analyzing Context', sublabel: 'Identifying keywords' },
    { label: 'Matching Skills', sublabel: 'Comparing qualifications' },
    { label: 'Finalizing Report', sublabel: 'Generating insights' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => Math.min(prev + 1, 3));
    }, 4000);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      clearInterval(stepInterval);
      setAnalysisStep(3);

      setTimeout(() => {
        setAnalysisResult(data.data.atsResult);
        setResumeText(data.data.resumeText);
        setCreditsUsed(prev => prev + 1);
      }, 300);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeFile, jobDescription]);

  const handleReset = () => {
    setResumeFile(null);
    setResumeText('');
    setJobDescription('');
    setAnalysisResult(null);
    setError(null);
    setAnalysisStep(0);
  };

  const isReadyToAnalyze = resumeFile && jobDescription.trim().length >= 50;

  // Results View
  if (analysisResult) {
    return (
      <ResultsDashboard
        result={analysisResult}
        resumeText={resumeText}
        jobDescription={jobDescription}
        onReset={handleReset}
      />
    );
  }

  // Analyzing View
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-8 text-center bg-blue-600">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <PiLightning className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Profile</h2>
            <p className="text-blue-100">Optimizing for ATS compatibility</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {analysisSteps.map((step, index) => {
                const isActive = index === analysisStep;
                const isComplete = index < analysisStep;

                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors ${isComplete ? 'bg-green-500 border-green-500 text-white' :
                      isActive ? 'border-blue-600 text-blue-600' :
                        'border-slate-200 text-slate-300'
                      }`}>
                      {isComplete ? <PiCheckCircle className="w-4 h-4" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${isActive || isComplete ? 'text-slate-900' : 'text-slate-400'
                        }`}>{step.label}</p>
                      <p className="text-xs text-slate-500">{step.sublabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Split Screen Landing
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-white font-sans text-slate-900">

      {/* Left Side - Hero Content */}
      <div className="lg:w-[40%] bg-blue-600 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2 mb-12 lg:mb-0">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <PiStrategy className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xl font-bold tracking-tight">GetLanded ATS</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Master the Application System
          </h1>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            Stop guessing. Our advanced ATS analyzer compares your resume against job descriptions to provide actionable, data-driven insights.
          </p>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <PiTarget className="w-6 h-6 text-blue-200" />
              <div>
                <p className="font-semibold">Precision Matching</p>
                <p className="text-sm text-blue-100 opacity-80">Keyword frequency & relevance analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <PiFileText className="w-6 h-6 text-blue-200" />
              <div>
                <p className="font-semibold">Format Verification</p>
                <p className="text-sm text-blue-100 opacity-80">Structure & readability checks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="relative z-10 mt-12 lg:mt-0 text-sm text-blue-200 opacity-60">
          Professional ATS Analysis Tool &copy; 2026
        </div>
      </div>

      {/* Right Side - Action Area */}
      <div className="lg:w-[60%] bg-slate-50 p-6 lg:p-12 xl:p-24 lg:overflow-y-auto lg:h-full">
        <div className="max-w-2xl mx-auto h-full flex flex-col">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">New Analysis</h2>
            <p className="text-slate-500">Upload your documents to get started</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
              <PiWarningCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto hover:bg-red-100 p-1 rounded">
                <PiXCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="grid gap-6 flex-1">
            {/* 1. Resume Upload */}
            <div className={`
              card transition-all duration-300 border-2
              ${resumeFile ? 'border-blue-500 shadow-md ring-4 ring-blue-500/5' : 'border-dashed border-slate-300 hover:border-blue-400 hover:bg-white'}
            `}>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="p-8 text-center relative"
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                {resumeFile ? (
                  <div className="flex flex-col items-center animate-in zoom-in-50 duration-300">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                      <PiFileText className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-bold text-slate-900">{resumeFile.name}</p>
                    <p className="text-sm text-slate-500 mb-4">{(resumeFile.size / 1024).toFixed(1)} KB • Ready</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg text-sm font-medium transition-colors z-30 relative"
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <PiUploadSimple className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Upload Resume</h3>
                    <p className="text-sm text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                      Drag & drop your PDF or DOCX file here, or click to browse
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Job Description */}
            <div className={`card flex flex-col transition-all duration-300 border-2 ${jobDescription.trim().length >= 50 ? 'border-blue-500 shadow-md ring-4 ring-blue-500/5' : 'border-slate-200'
              }`}>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full flex-1 p-6 bg-transparent border-none resize-none focus:ring-0 text-slate-700 placeholder:text-slate-400 leading-relaxed min-h-[200px]"
              />
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className={jobDescription.length < 50 ? 'text-amber-600 font-medium' : 'text-slate-500'}>
                  {jobDescription.length < 50 ? 'Minimum 50 characters required' : 'Input valid'}
                </span>
                <span className="font-mono text-slate-400">{jobDescription.length} chars</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleAnalyze}
              disabled={!isReadyToAnalyze}
              className={`
                w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3
                ${isReadyToAnalyze
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/30 hover:scale-[1.01]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }
              `}
            >
              Analyze Compatibility
              <PiLightning className={isReadyToAnalyze ? 'w-5 h-5' : 'hidden'} />
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              Secure Processing • Privacy Protected
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
