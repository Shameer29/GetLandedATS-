'use client';

import { useState } from 'react';
import { PiCopy, PiCheck, PiCheckCircle, PiXCircle, PiColumns, PiX, PiMagnifyingGlass } from 'react-icons/pi';
import type { SkillAnalysis } from '@/types';
import SideBySideComparison from './SideBySideComparison';

interface HardSkillsPanelProps {
    skills: SkillAnalysis[];
    resumeText?: string;
    jobDescription?: string;
}

export default function HardSkillsPanel({ skills, resumeText = '', jobDescription = '' }: HardSkillsPanelProps) {
    const [filter, setFilter] = useState<'all' | 'matched' | 'missing'>('all');
    const [copiedSkill, setCopiedSkill] = useState<string | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedSkill(text);
        setTimeout(() => setCopiedSkill(null), 2000);
    };

    const handleCopyAllMissing = async () => {
        const missingSkills = skills.filter(s => !s.matched).map(s => s.skill).join(', ');
        await navigator.clipboard.writeText(missingSkills);
        setCopiedSkill('all-missing');
        setTimeout(() => setCopiedSkill(null), 2000);
    };

    const filteredSkills = skills.filter(s => {
        if (filter === 'matched') return s.matched;
        if (filter === 'missing') return !s.matched;
        return true;
    });

    const matchedCount = skills.filter(s => s.matched).length;
    const missingCount = skills.filter(s => !s.matched).length;
    const requiredMissing = skills.filter(s => !s.matched && s.required);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Hard Skills Analysis</h2>
                    <p className="text-sm text-slate-600">Technical competencies extracted from the job description</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wide rounded-full border border-green-100">
                            {matchedCount} Matched
                        </span>
                        <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold uppercase tracking-wide rounded-full border border-red-100">
                            {missingCount} Missing
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
                                Highlighting <strong>only</strong> hard skills in both documents.
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

            {/* Critical Alert */}
            {!showComparison && requiredMissing.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <PiXCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-900">
                                    {requiredMissing.length} Required Skills Missing
                                </p>
                                <p className="text-sm text-red-700 mt-0.5">
                                    These are critical qualifications. Adding them usually provides the biggest score boost.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleCopyAllMissing}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                        >
                            {copiedSkill === 'all-missing' ? <PiCheck className="w-4 h-4" /> : <PiCopy className="w-4 h-4" />}
                            {copiedSkill === 'all-missing' ? 'Copied All' : 'Copy All Missing'}
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            {!showComparison && (
                <div className="flex gap-2 border-b border-slate-200">
                    {[
                        { id: 'all', label: `All Skills`, count: skills.length },
                        { id: 'matched', label: `Matched`, count: matchedCount },
                        { id: 'missing', label: `Missing`, count: missingCount },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as 'all' | 'matched' | 'missing')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${filter === tab.id
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {tab.label}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${filter === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Skills Table */}
            {!showComparison && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequency</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSkills.map((skill, i) => (
                                    <tr key={i} className={`group hover:bg-slate-50/80 transition-colors ${!skill.matched ? 'bg-red-50/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <p className={`text-sm font-medium ${skill.matched ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {skill.skill}
                                            </p>
                                            {skill.context && (
                                                <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{skill.context}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {skill.required ? (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-100">
                                                    Required
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-200">
                                                    Preferred
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-xs text-slate-500">
                                                <span title="In Job Description">JD: {skill.jdCount}</span>
                                                <span className="mx-1.5 text-slate-300">|</span>
                                                <span title="In Resume" className={skill.resumeCount > 0 ? 'text-green-600 font-medium' : 'text-slate-400'}>
                                                    You: {skill.resumeCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {skill.matched ? (
                                                <span className="inline-flex items-center gap-1.5 text-green-700 text-sm font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    Matched
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                    Missing
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {!skill.matched ? (
                                                <button
                                                    onClick={() => handleCopy(skill.skill)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    {copiedSkill === skill.skill ? <PiCheck className="w-3.5 h-3.5" /> : <PiCopy className="w-3.5 h-3.5" />}
                                                    {copiedSkill === skill.skill ? 'Copied' : 'Copy'}
                                                </button>
                                            ) : (
                                                <PiCheckCircle className="w-5 h-5 text-green-200 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSkills.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <PiMagnifyingGlass className="w-6 h-6 text-slate-400" /> {/* Note: Need to import PiMagnifyingGlass if not present, but wait, checking imports... PiMagnifyingGlass is NOT imported. I missed it. */}
                            </div>
                            <p className="text-slate-500 font-medium">No skills found with current filter</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
