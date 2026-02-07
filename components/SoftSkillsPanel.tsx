'use client';

import { useState } from 'react';
import { PiCopy, PiCheck, PiCheckCircle, PiXCircle, PiColumns, PiX, PiHeart } from 'react-icons/pi';
import type { SkillAnalysis } from '@/types';
import SideBySideComparison from './SideBySideComparison';

interface SoftSkillsPanelProps {
    skills: SkillAnalysis[];
    resumeText?: string;
    jobDescription?: string;
}

export default function SoftSkillsPanel({ skills, resumeText = '', jobDescription = '' }: SoftSkillsPanelProps) {
    const [copiedSkill, setCopiedSkill] = useState<string | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedSkill(text);
        setTimeout(() => setCopiedSkill(null), 2000);
    };

    const matchedCount = skills.filter(s => s.matched).length;
    const totalCount = skills.length;
    const matchPercentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Soft Skills Analysis</h2>
                    <p className="text-sm text-slate-600">Interpersonal traits and attributes extracted from the JD</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${matchPercentage >= 70 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {matchPercentage}% Match
                        </span>
                    </div>

                    {/* Comparison Toggle */}
                    {resumeText && jobDescription && (
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all shadow-sm ${showComparison
                                ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200'
                                }`}
                        >
                            {showComparison ? <PiX className="w-4 h-4" /> : <PiColumns className="w-4 h-4" />}
                            {showComparison ? 'Close Comparison' : 'Compare View'}
                        </button>
                    )}
                </div>
            </div>

            {/* Inline Comparison View */}
            {showComparison && resumeText && jobDescription && (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-lg shadow-slate-200/50 bg-white">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <PiColumns className="text-slate-500" />
                                Side-by-Side Analysis
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Highlighting <strong>only</strong> soft skills in both documents.
                            </p>
                        </div>
                    </div>
                    <SideBySideComparison
                        resumeText={resumeText}
                        jobDescription={jobDescription}
                        matchedSkills={skills.filter(s => s.matched).map(s => ({
                            skill: s.skill,
                            importance: s.required ? 'required' : 'preferred',
                            foundInResume: true
                        }))}
                        missingSkills={skills.filter(s => !s.matched).map(s => ({
                            skill: s.skill,
                            importance: s.required ? 'required' : 'preferred',
                            foundInResume: false
                        }))}
                    />
                </div>
            )}

            {/* Skills Grid */}
            {!showComparison && (
                <div className="grid md:grid-cols-2 gap-4">
                    {skills.map((skill, i) => (
                        <div
                            key={i}
                            className={`p-5 rounded-xl border transition-all hover:shadow-md ${skill.matched
                                ? 'bg-white border-slate-200'
                                : 'bg-red-50/10 border-red-100'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${skill.matched ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                        {skill.matched ? (
                                            <PiCheckCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <PiHeart className="w-6 h-6 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-base ${skill.matched ? 'text-slate-900' : 'text-red-900'}`}>
                                            {skill.skill}
                                        </p>
                                        {skill.context ? (
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">"{skill.context}"</p>
                                        ) : (
                                            <p className="text-sm text-red-600 mt-1 italic">Not found in your resume</p>
                                        )}
                                    </div>
                                </div>
                                {!skill.matched && (
                                    <button
                                        onClick={() => handleCopy(skill.skill)}
                                        className="flex-shrink-0 p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"
                                        title="Copy skill"
                                    >
                                        {copiedSkill === skill.skill ? (
                                            <PiCheck className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <PiCopy className="w-5 h-5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {skills.length === 0 && (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                    <p className="text-slate-500 font-medium">No soft skills detected in job description</p>
                </div>
            )}
        </div>
    );
}
