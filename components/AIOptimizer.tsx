'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiZap, FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { OptimizeSuggestion, CVEnhancementResult, EnhancedSection } from '@/types/universal-ats';

interface AIOptimizerProps {
    suggestions: OptimizeSuggestion[];
    cvEnhancement?: CVEnhancementResult;
}

export default function AIOptimizer({ suggestions, cvEnhancement }: AIOptimizerProps) {
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['summary']));

    const bulletRewrites = cvEnhancement?.bulletRewrites || [];
    const keywordIntegrations = cvEnhancement?.keywordIntegrations || [];
    const enhancedSections = cvEnhancement?.enhancedSections || [];
    const overallImprovement = cvEnhancement?.overallImprovement || 0;

    // Combine all suggestions
    const allSuggestions = [...bulletRewrites, ...keywordIntegrations, ...suggestions].filter(s => s.suggested);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyAll = async () => {
        const allText = [
            ...enhancedSections.map(s => `${s.sectionName}:\n${s.optimized}`),
            ...allSuggestions.map(s => s.suggested)
        ].join('\n\n');
        await navigator.clipboard.writeText(allText);
        setCopiedIndex('all');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const toggleExpanded = (id: string) => {
        const newSet = new Set(expandedItems);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedItems(newSet);
    };

    const hasContent = enhancedSections.length > 0 || allSuggestions.length > 0;

    if (!hasContent) {
        return (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                <FiZap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-500">AI Optimizer is analyzing...</p>
                <p className="text-sm text-slate-400 mt-1">Generating personalized improvements for your resume</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Improvement Score */}
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FiZap className="w-6 h-6" />
                        AI-Powered Optimizations
                    </h3>
                    <p className="text-violet-200 mt-1">
                        {allSuggestions.length + enhancedSections.length} improvements ready to copy
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {overallImprovement > 0 && (
                        <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                            <p className="text-xs text-violet-200 font-medium">Score Boost</p>
                            <p className="text-2xl font-black">+{overallImprovement}%</p>
                        </div>
                    )}
                    <button
                        onClick={handleCopyAll}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors"
                    >
                        {copiedIndex === 'all' ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                        {copiedIndex === 'all' ? 'Copied All!' : 'Copy All'}
                    </button>
                </div>
            </div>

            {/* Enhanced Sections (Summary, etc.) */}
            {enhancedSections.map((section, i) => (
                <div key={`s-${i}`} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleExpanded(`section-${i}`)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-violet-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                {i + 1}
                            </span>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-900">Rewrite: {section.sectionName}</h4>
                                <p className="text-sm text-slate-500">
                                    +{section.improvementScore}% improvement • {section.keywordsAdded.length} keywords added
                                </p>
                            </div>
                        </div>
                        {expandedItems.has(`section-${i}`) ? <FiChevronUp className="w-5 h-5 text-slate-400" /> : <FiChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {expandedItems.has(`section-${i}`) && (
                        <div className="p-6 space-y-4">
                            {/* Before */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Before (Current)</p>
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-slate-700">
                                    {section.original || 'No existing section'}
                                </div>
                            </div>

                            {/* After */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">After (Optimized)</p>
                                    <button
                                        onClick={() => handleCopy(section.optimized, `section-${i}`)}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        {copiedIndex === `section-${i}` ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                                        {copiedIndex === `section-${i}` ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-slate-700">
                                    {section.optimized}
                                </div>
                            </div>

                            {/* Keywords Added */}
                            {section.keywordsAdded.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Keywords Added:</span>
                                    {section.keywordsAdded.map((kw, j) => (
                                        <span key={j} className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Bullet Point Rewrites */}
            {allSuggestions.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h4 className="font-bold text-slate-900">Bullet Point Improvements</h4>
                        <p className="text-sm text-slate-500">{allSuggestions.length} suggestions to strengthen your resume</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {allSuggestions.slice(0, 10).map((suggestion, i) => (
                            <div key={`sug-${i}`} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="grid lg:grid-cols-2 gap-4">
                                    {/* Original */}
                                    <div>
                                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Original</p>
                                        <p className="text-sm text-slate-600 line-through">{suggestion.original || 'Add new content'}</p>
                                    </div>

                                    {/* Suggested */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Optimized</p>
                                            <button
                                                onClick={() => handleCopy(suggestion.suggested, `sug-${i}`)}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                                            >
                                                {copiedIndex === `sug-${i}` ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                                                {copiedIndex === `sug-${i}` ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-900 font-medium">{suggestion.suggested}</p>
                                        <p className="text-xs text-slate-500 mt-1 italic">{suggestion.reason}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
