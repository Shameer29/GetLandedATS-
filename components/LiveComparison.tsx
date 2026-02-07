'use client';

import React, { useState } from 'react';
import { FiFileText, FiBriefcase, FiEye, FiEyeOff } from 'react-icons/fi';

interface LiveComparisonProps {
    resumeText: string;
    jobDescription: string;
    matchedSkills: string[];
    missingSkills: string[];
}

export default function LiveComparison({
    resumeText,
    jobDescription,
    matchedSkills,
    missingSkills
}: LiveComparisonProps) {
    const [showMatched, setShowMatched] = useState(true);
    const [showMissing, setShowMissing] = useState(true);

    const highlightText = (text: string, isResume: boolean) => {
        if (!text) return null;

        let result = text;
        const highlights: { start: number; end: number; type: 'matched' | 'missing' }[] = [];

        // Find all skill occurrences
        const lowerText = text.toLowerCase();

        if (showMatched) {
            matchedSkills.forEach(skill => {
                let pos = 0;
                const lowerSkill = skill.toLowerCase();
                while ((pos = lowerText.indexOf(lowerSkill, pos)) !== -1) {
                    highlights.push({ start: pos, end: pos + skill.length, type: 'matched' });
                    pos += skill.length;
                }
            });
        }

        if (showMissing && !isResume) {
            missingSkills.forEach(skill => {
                let pos = 0;
                const lowerSkill = skill.toLowerCase();
                while ((pos = lowerText.indexOf(lowerSkill, pos)) !== -1) {
                    highlights.push({ start: pos, end: pos + skill.length, type: 'missing' });
                    pos += skill.length;
                }
            });
        }

        // Sort highlights by position
        highlights.sort((a, b) => a.start - b.start);

        // Build highlighted content
        const parts: React.ReactNode[] = [];
        let lastEnd = 0;

        highlights.forEach((h, i) => {
            if (h.start > lastEnd) {
                parts.push(<span key={`text-${i}`}>{text.slice(lastEnd, h.start)}</span>);
            }
            parts.push(
                <mark
                    key={`highlight-${i}`}
                    className={h.type === 'matched'
                        ? 'bg-green-100 text-green-800 px-0.5 rounded'
                        : 'bg-red-100 text-red-800 px-0.5 rounded'
                    }
                >
                    {text.slice(h.start, h.end)}
                </mark>
            );
            lastEnd = h.end;
        });

        if (lastEnd < text.length) {
            parts.push(<span key="text-last">{text.slice(lastEnd)}</span>);
        }

        return parts.length > 0 ? parts : text;
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-900">Side-by-Side Comparison</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMatched(!showMatched)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded border transition-colors ${showMatched
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-white border-slate-200 text-slate-500'
                            }`}
                    >
                        {showMatched ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                        Matched
                    </button>
                    <button
                        onClick={() => setShowMissing(!showMissing)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded border transition-colors ${showMissing
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-slate-200 text-slate-500'
                            }`}
                    >
                        {showMissing ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                        Missing
                    </button>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Resume Panel */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                        <FiFileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Your Resume</span>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {resumeText ? highlightText(resumeText, true) : (
                                <p className="text-slate-400 italic">Resume text not available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Description Panel */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                        <FiBriefcase className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Job Description</span>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {jobDescription ? highlightText(jobDescription, false) : (
                                <p className="text-slate-400 italic">Job description not available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
                    Matched keywords
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span>
                    Missing in resume
                </span>
            </div>
        </div>
    );
}
