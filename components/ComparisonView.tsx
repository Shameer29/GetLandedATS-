'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

interface ComparisonViewProps {
    resumeText: string;
    jobDescription: string;
    matchedKeywords: Array<{ term: string; category: string }>;
    missingKeywords: Array<{ term: string; category: string }>;
    partialKeywords?: Array<{ term: string; category: string }>;
}

export default function ComparisonView({
    resumeText,
    jobDescription,
    matchedKeywords,
    missingKeywords,
    partialKeywords = [],
}: ComparisonViewProps) {
    const [highlightMode, setHighlightMode] = useState<'all' | 'matched' | 'missing'>('all');

    // Format text with GetLanded theme support
    const formatText = (text: string) => {
        let lines = text.split('\n');
        let formatted = '';

        const sectionHeaders = [
            'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'PROJECTS', 'ACHIEVEMENTS', 'CONTACT'
        ];

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) {
                formatted += '<div class="h-3"></div>\n';
                return;
            }

            const upperLine = trimmedLine.toUpperCase();
            const isHeader = sectionHeaders.some(header => upperLine.includes(header));

            if (isHeader && trimmedLine.length < 50) {
                formatted += `<div class="text-xs font-black text-slate-900 mt-6 mb-3 pb-1 border-b-2 border-slate-100 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-sm">[SECTION]: ${trimmedLine}</div>\n`;
            } else if (trimmedLine.match(/^[•\-*\u2022]/)) {
                const bulletContent = trimmedLine.replace(/^[•\-*\u2022]\s*/, '');
                formatted += `<div class="flex gap-2 mb-2 ml-4"><span class="text-blue-600 flex-shrink-0 font-black">›</span><span class="flex-1 text-slate-600 text-sm font-bold">${bulletContent}</span></div>\n`;
            } else {
                formatted += `<div class="mb-2 text-slate-600 text-sm font-medium tracking-tight">${trimmedLine}</div>\n`;
            }
        });

        return formatted;
    };

    const highlightText = (text: string, isResume: boolean) => {
        let highlighted = formatText(text);

        const keywords = isResume
            ? [...matchedKeywords, ...partialKeywords]
            : [...matchedKeywords, ...missingKeywords, ...partialKeywords];

        keywords.forEach(({ term }) => {
            const isMatched = matchedKeywords.some(k => k.term === term);
            const isPartial = partialKeywords.some(k => k.term === term);
            const isMissing = missingKeywords.some(k => k.term === term);

            if (highlightMode === 'matched' && !isMatched) return;
            if (highlightMode === 'missing' && !isMissing) return;

            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');

            let className = '';
            if (isMatched) className = 'bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-black uppercase text-[0.8em] shadow-sm ml-1';
            else if (isPartial) className = 'bg-amber-100 text-amber-700 border-2 border-amber-200 px-1.5 py-0.5 rounded-md font-black uppercase text-[0.8em] ml-1';
            else className = 'bg-red-100 text-red-700 border-2 border-red-200 px-1.5 py-0.5 rounded-md font-black uppercase text-[0.8em] ml-1';

            highlighted = highlighted.replace(
                regex,
                (match) => `<mark class="${className}">${match}</mark>`
            );
        });

        return highlighted;
    };

    const matchStats = {
        matched: matchedKeywords.length,
        partial: partialKeywords.length,
        missing: missingKeywords.length,
        total: matchedKeywords.length + partialKeywords.length + missingKeywords.length,
    };

    const matchPercentage = matchStats.total > 0
        ? Math.round(((matchStats.matched + matchStats.partial * 0.5) / matchStats.total) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header HUD */}
            <div className="terminal-card bg-white p-6 md:p-8 border-slate-200 shadow-xl">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Side-by-Side Comparison</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Resume vs Job Description</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Alignment</span>
                            <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">{matchPercentage}%</span>
                        </div>
                        <div className="hidden md:block w-px h-16 bg-slate-100" />
                        <div className="grid grid-cols-3 gap-6 md:gap-8 w-full md:w-auto">
                            <div className="text-center">
                                <div className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Match</div>
                                <div className="text-xl md:text-2xl font-black text-blue-600">{matchStats.matched}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Partial</div>
                                <div className="text-xl md:text-2xl font-black text-amber-500">{matchStats.partial}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Omitted</div>
                                <div className="text-xl md:text-2xl font-black text-red-500">{matchStats.missing}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Filter_Mode:</span>
                    <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto">
                        {(['all', 'matched', 'missing'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setHighlightMode(mode)}
                                className={`flex-1 md:flex-none px-4 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${highlightMode === mode
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-blue-600'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="terminal-card bg-white border-slate-200 shadow-xl flex flex-col h-[500px] md:h-[700px] overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate pr-4">Input_Profile [RESUME]</h4>
                        <div className="text-[8px] md:text-[10px] text-blue-600 font-black bg-white px-2 py-0.5 rounded border border-blue-100 shrink-0">Resume</div>
                    </div>
                    <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div
                            className="text-slate-700 text-sm leading-loose whitespace-pre-wrap font-mono break-words"
                            dangerouslySetInnerHTML={{ __html: highlightText(resumeText, true) }}
                        />
                    </div>
                </div>

                <div className="terminal-card bg-white border-slate-200 shadow-xl flex flex-col h-[500px] md:h-[700px] overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate pr-4">Target_Vector [JOB_DESC]</h4>
                        <div className="text-[8px] md:text-[10px] text-blue-600 font-black bg-white px-2 py-0.5 rounded border border-blue-100 shrink-0">Job Description</div>
                    </div>
                    <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div
                            className="text-slate-700 text-sm leading-loose whitespace-pre-wrap font-mono break-words"
                            dangerouslySetInnerHTML={{ __html: highlightText(jobDescription, false) }}
                        />
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-10 py-6 border border-slate-200 bg-white px-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-600 rounded-md shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Signal_Match</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-amber-100 border-2 border-amber-200 rounded-md shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Partial</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded-md shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Missingtor</span>
                </div>
            </div>
        </motion.div>
    );
}
