'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBarChart2, FiFileText, FiTarget, FiCheckCircle } from 'react-icons/fi';
import { AnalysisResult } from '@/types';
import MatchPercentage from './MatchPercentage';
import SkillsGapChart from './SkillsGapChart';
import ComparisonView from './ComparisonView';
import KeywordComparison from './KeywordComparison';
import RecommendationCard from './RecommendationCard';
import ResumeChecklist from './ResumeChecklist';
import { generateImprovementSuggestions } from '@/lib/ats-utils';

interface AnalysisResultsProps {
    result: AnalysisResult;
    onReset: () => void;
    resumeText?: string;
    jobDescription?: string;
}

type TabType = 'overview' | 'comparison' | 'skills' | 'recommendations';

export default function AnalysisResults({ result, onReset, resumeText = '', jobDescription = '' }: AnalysisResultsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const suggestions = generateImprovementSuggestions(result.score);

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: FiBarChart2 },
        { id: 'comparison' as TabType, label: 'Comparison', icon: FiFileText },
        { id: 'skills' as TabType, label: 'Skills', icon: FiTarget },
        { id: 'recommendations' as TabType, label: 'Recommendations', icon: FiCheckCircle },
    ];

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Analysis Results</h2>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-600" />
                        <p className="text-sm text-slate-600">Analysis complete</p>
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-md rounded-lg"
                >
                    Analyze Another Resume
                </button>
            </div>

            {/* HUD Navigation Tabs */}
            <div className="sticky top-[73px] md:top-20 z-30 bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-xl">
                <div className="grid grid-cols-4 gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 px-2 md:px-6 py-3 md:py-4 transition-all duration-300 rounded-xl ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-transparent text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center">{tab.label.split(' ')[0]}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-active-indicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 md:w-8 h-1 bg-white rounded-full hidden md:block"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Match Percentage */}
                            <MatchPercentage score={result.score.overall} breakdown={result.score.breakdown} />

                            {/* Resume Checklist */}
                            <ResumeChecklist result={result} resumeText={resumeText} jobDescription={jobDescription} />


                            {/* Summary Card */}
                            <div className="terminal-card bg-white p-6 md:p-10 border-slate-200 shadow-xl shadow-slate-200/50">
                                <div className="flex items-center gap-3 mb-6 md:mb-8">
                                    <div className="w-2 h-4 bg-blue-600" />
                                    <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.4em]">Executive Summary</h3>
                                </div>
                                <p className="text-slate-600 text-lg md:text-2xl leading-relaxed font-black tracking-tight border-l-4 border-blue-600/10 pl-4 md:pl-8">
                                    "{result.summary}"
                                </p>
                            </div>

                            {/* Strengths & Weaknesses HUD */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                <div className="terminal-card bg-white p-6 md:p-8 border-blue-600/10 shadow-lg">
                                    <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-blue-50 pb-4">
                                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Strengths</h3>
                                        <span className="text-[8px] font-black text-blue-600/30"></span>
                                    </div>
                                    <ul className="space-y-4 md:space-y-5">
                                        {result.strengths.map((strength, index) => (
                                            <li key={index} className="flex items-start gap-4 group">
                                                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <FiCheckCircle className="text-blue-600 w-3 h-3" />
                                                </div>
                                                <span className="text-slate-900 text-sm font-bold uppercase tracking-tight">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="terminal-card bg-white p-6 md:p-8 border-red-500/10 shadow-lg">
                                    <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-red-50 pb-4">
                                        <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">[FRICTION_DETECTION]</h3>
                                        <span className="text-[8px] font-black text-red-500/30">ALIGN_GAP</span>
                                    </div>
                                    <ul className="space-y-4 md:space-y-5">
                                        {result.weaknesses.map((weakness, index) => (
                                            <li key={index} className="flex items-start gap-4 group">
                                                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-red-500 font-black text-[10px]">!</span>
                                                </div>
                                                <span className="text-slate-900 text-sm font-bold uppercase tracking-tight">{weakness}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Strategic Wins Layer */}
                            {suggestions.length > 0 && (
                                <div className="terminal-card bg-blue-600 p-6 md:p-10 border-none overflow-hidden relative shadow-2xl shadow-blue-500/30">
                                    <div className="absolute top-0 right-0 p-8 text-white opacity-10 hidden md:block">
                                        <FiTarget size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-[10px] md:text-xs font-black text-blue-100 mb-8 md:mb-10 flex items-center gap-3 uppercase tracking-[0.4em]">
                                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                            Mission_Optimization_Protocol
                                        </h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 md:gap-y-6">
                                            {suggestions.map((suggestion: string, index: number) => (
                                                <li key={index} className="flex items-start gap-4 border-b border-white/10 pb-4">
                                                    <span className="text-blue-300 text-[10px] font-black mt-1 shrink-0">LOG://</span>
                                                    <span className="text-white text-xs md:text-sm font-black uppercase tracking-tight leading-tight">{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Domain Analysis HUD */}
                            <div className="pt-12">
                                <div className="flex items-center gap-6 mb-10">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Neural_Domain_Metrics</h3>
                                    <div className="flex-1 h-px bg-slate-200" />
                                </div>
                                <KeywordComparison
                                    matched={result.keywordAnalysis.matched}
                                    missing={result.keywordAnalysis.missing}
                                    partial={result.keywordAnalysis.partial}
                                    extra={result.keywordAnalysis.extra}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div className="pt-4">
                            <ComparisonView
                                resumeText={resumeText}
                                jobDescription={jobDescription}
                                matchedKeywords={result.keywordAnalysis.matched}
                                missingKeywords={result.keywordAnalysis.missing}
                                partialKeywords={result.keywordAnalysis.partial}
                            />
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-8 pt-4">
                            <div className="terminal-card bg-white p-10 border-slate-200 shadow-xl">
                                <h3 className="text-xs font-black text-slate-400 mb-10 uppercase tracking-[0.4em]">Skill_Vector_Mapping</h3>
                                <SkillsGapChart
                                    matchedKeywords={result.keywordAnalysis.matched}
                                    missingKeywords={result.keywordAnalysis.missing}
                                    partialKeywords={result.keywordAnalysis.partial}
                                />
                            </div>

                            {/* Structural Integrity HUD */}
                            {result.formatIssues.length > 0 && (
                                <div className="terminal-card bg-white p-10 border-red-500/20 shadow-xl">
                                    <h3 className="text-xs font-black text-red-600 mb-10 uppercase tracking-[0.4em]">Structural_Anomalies_Detected</h3>
                                    <div className="space-y-6">
                                        {result.formatIssues.map((issue, index) => (
                                            <motion.div
                                                key={index}
                                                className="p-6 border border-slate-100 bg-slate-50 flex items-start gap-6 rounded-xl hover:border-red-500/30 transition-all"
                                            >
                                                <div className={`mt-1.5 h-3 w-3 rounded-full ${issue.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{issue.message}</p>
                                                    <div className="mt-3 py-2 px-4 bg-white rounded border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-blue-600 uppercase">CMD_REPAIR:</span>
                                                            <span className="font-bold text-slate-900">{issue.suggestion}</span>
                                                        </div>
                                                        <FiCheckCircle className="text-slate-200" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'recommendations' && (
                        <div className="space-y-8 pt-4">
                            <div className="terminal-card bg-white p-10 border-slate-200 shadow-xl">
                                <div className="flex flex-col gap-2 mb-12">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">Mission_Critical_Objectives</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Priority weighted optimizations for maximum system approval.</p>
                                </div>
                                <div className="space-y-8">
                                    {result.recommendations
                                        .sort((a, b) => {
                                            const priority = { high: 0, medium: 1, low: 2 };
                                            return priority[a.priority as keyof typeof priority] - priority[b.priority as keyof typeof priority];
                                        })
                                        .map((recommendation, index) => (
                                            <motion.div
                                                key={recommendation.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <RecommendationCard recommendation={recommendation} />
                                            </motion.div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
