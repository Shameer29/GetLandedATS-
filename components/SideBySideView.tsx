'use client';

import { useState, useMemo } from 'react';
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';

interface SkillMatch {
    skill: string;
    importance: 'required' | 'preferred' | 'bonus';
    foundInResume: boolean;
    jdFrequency?: number;
    resumeFrequency?: number;
    proof?: string;
}

interface SideBySideViewProps {
    resumeText: string;
    jobDescription: string;
    matchedSkills: SkillMatch[];
    missingSkills: SkillMatch[];
}

export default function SideBySideView({
    resumeText,
    jobDescription,
    matchedSkills,
    missingSkills
}: SideBySideViewProps) {
    const [showAllHighlights, setShowAllHighlights] = useState(true);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    // Get all keywords for highlighting
    const allMatchedKeywords = useMemo(() =>
        matchedSkills.map(s => s.skill.toLowerCase()), [matchedSkills]
    );
    const allMissingKeywords = useMemo(() =>
        missingSkills.map(s => s.skill.toLowerCase()), [missingSkills]
    );

    // Highlight text function
    const highlightText = (text: string, isResume: boolean) => {
        if (!showAllHighlights) return text;

        let result = text;
        const keywordsToHighlight = isResume
            ? [...allMatchedKeywords]
            : [...allMatchedKeywords, ...allMissingKeywords];

        // Create spans for highlighting
        const parts: { text: string; type: 'matched' | 'missing' | 'normal' }[] = [];
        const words = text.split(/(\s+)/);

        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[.,!?;:()]/g, '');
            if (allMatchedKeywords.some(kw =>
                cleanWord === kw.toLowerCase() ||
                cleanWord.includes(kw.toLowerCase()) ||
                kw.toLowerCase().includes(cleanWord)
            )) {
                parts.push({ text: word, type: 'matched' });
            } else if (!isResume && allMissingKeywords.some(kw =>
                cleanWord === kw.toLowerCase() ||
                cleanWord.includes(kw.toLowerCase())
            )) {
                parts.push({ text: word, type: 'missing' });
            } else {
                parts.push({ text: word, type: 'normal' });
            }
        });

        return parts;
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const resumeParts = useMemo(() => highlightText(resumeText, true), [resumeText, allMatchedKeywords, showAllHighlights]);
    const jdParts = useMemo(() => highlightText(jobDescription, false), [jobDescription, allMatchedKeywords, allMissingKeywords, showAllHighlights]);

    return (
        <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-green-400"></span>
                        <span className="text-sm text-slate-600">Matched Keywords ({matchedSkills.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-red-400"></span>
                        <span className="text-sm text-slate-600">Missing (Need to Add) ({missingSkills.length})</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowAllHighlights(!showAllHighlights)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                >
                    <FiSearch className="w-4 h-4" />
                    {showAllHighlights ? 'Hide' : 'Show'} Highlights
                </button>
            </div>

            {/* Side by Side Panels */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Resume Panel */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-white font-bold">Your Resume</h3>
                        <button
                            onClick={() => handleCopy(resumeText)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
                        >
                            {copiedText === resumeText ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                            {copiedText === resumeText ? 'Copied!' : 'Copy All'}
                        </button>
                    </div>
                    <div className="p-4 max-h-[500px] overflow-y-auto">
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono">
                            {Array.isArray(resumeParts) ? (
                                resumeParts.map((part, i) => (
                                    <span
                                        key={i}
                                        className={
                                            part.type === 'matched'
                                                ? 'bg-green-200 text-green-800 px-0.5 rounded font-semibold'
                                                : ''
                                        }
                                    >
                                        {part.text}
                                    </span>
                                ))
                            ) : resumeParts}
                        </div>
                    </div>
                </div>

                {/* Job Description Panel */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-white font-bold">Job Description</h3>
                        <button
                            onClick={() => handleCopy(jobDescription)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
                        >
                            {copiedText === jobDescription ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                            {copiedText === jobDescription ? 'Copied!' : 'Copy All'}
                        </button>
                    </div>
                    <div className="p-4 max-h-[500px] overflow-y-auto">
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono">
                            {Array.isArray(jdParts) ? (
                                jdParts.map((part, i) => (
                                    <span
                                        key={i}
                                        className={
                                            part.type === 'matched'
                                                ? 'bg-green-200 text-green-800 px-0.5 rounded font-semibold'
                                                : part.type === 'missing'
                                                    ? 'bg-red-200 text-red-800 px-0.5 rounded font-semibold'
                                                    : ''
                                        }
                                    >
                                        {part.text}
                                    </span>
                                ))
                            ) : jdParts}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
