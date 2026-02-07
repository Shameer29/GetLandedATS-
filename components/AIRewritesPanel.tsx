'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiEdit3 } from 'react-icons/fi';
import type { AIRewrites } from '@/lib/ats-engine';

interface AIRewritesPanelProps {
    rewrites: AIRewrites;
}

export default function AIRewritesPanel({ rewrites }: AIRewritesPanelProps) {
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'bullets', 'skills']));

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const toggleSection = (section: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(section)) {
            newSet.delete(section);
        } else {
            newSet.add(section);
        }
        setExpandedSections(newSet);
    };

    const hasContent = rewrites.summary || rewrites.bullets.length > 0 || rewrites.skillSentences.length > 0;

    if (!hasContent) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <FiEdit3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No suggestions available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Improvement Suggestions</h2>
                <p className="text-sm text-slate-600">Copy-ready improvements for your resume</p>
            </div>

            {/* Summary Rewrite */}
            {rewrites.summary && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('summary')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-medium text-slate-700">
                                1
                            </span>
                            <span className="font-medium text-slate-900">Professional Summary</span>
                        </div>
                        {expandedSections.has('summary') ? (
                            <FiChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <FiChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {expandedSections.has('summary') && (
                        <div className="px-4 pb-4 border-t border-slate-100">
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm text-slate-700 leading-relaxed">{rewrites.summary}</p>
                                    <button
                                        onClick={() => handleCopy(rewrites.summary, 'summary')}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                        {copiedIndex === 'summary' ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                                        {copiedIndex === 'summary' ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Bullet Rewrites */}
            {rewrites.bullets.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('bullets')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-medium text-slate-700">
                                2
                            </span>
                            <span className="font-medium text-slate-900">
                                Bullet Point Improvements
                                <span className="ml-2 text-sm font-normal text-slate-500">({rewrites.bullets.length})</span>
                            </span>
                        </div>
                        {expandedSections.has('bullets') ? (
                            <FiChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <FiChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {expandedSections.has('bullets') && (
                        <div className="border-t border-slate-100 divide-y divide-slate-100">
                            {rewrites.bullets.map((bullet, i) => (
                                <div key={i} className="p-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Original</p>
                                            <p className="text-sm text-slate-500">{bullet.original}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Improved</p>
                                                <button
                                                    onClick={() => handleCopy(bullet.rewritten, `bullet-${i}`)}
                                                    className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded transition-colors"
                                                >
                                                    {copiedIndex === `bullet-${i}` ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                                                    {copiedIndex === `bullet-${i}` ? 'Copied' : 'Copy'}
                                                </button>
                                            </div>
                                            <p className="text-sm text-slate-900">{bullet.rewritten}</p>
                                            <p className="text-xs text-slate-500 mt-2">{bullet.improvement}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Skill Sentences */}
            {rewrites.skillSentences.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('skills')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-medium text-slate-700">
                                3
                            </span>
                            <span className="font-medium text-slate-900">
                                Add Missing Skills
                                <span className="ml-2 text-sm font-normal text-slate-500">({rewrites.skillSentences.length})</span>
                            </span>
                        </div>
                        {expandedSections.has('skills') ? (
                            <FiChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <FiChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {expandedSections.has('skills') && (
                        <div className="border-t border-slate-100 p-4 space-y-3">
                            {rewrites.skillSentences.map((item, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded mb-2">
                                            {item.skill}
                                        </span>
                                        <p className="text-sm text-slate-700">{item.sentence}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(item.sentence, `skill-${i}`)}
                                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                        {copiedIndex === `skill-${i}` ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                                        {copiedIndex === `skill-${i}` ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
