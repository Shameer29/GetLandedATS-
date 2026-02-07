'use client';

import { Keyword } from '@/types';

interface KeywordComparisonProps {
    matched: Keyword[];
    missing: Keyword[];
    partial: Keyword[];
    extra?: Keyword[];
}

export default function KeywordComparison({ matched, missing, partial, extra = [] }: KeywordComparisonProps) {
    const renderKeywordBadge = (keyword: Keyword, type: 'matched' | 'missing' | 'partial' | 'extra') => {
        let badgeClass = '';

        if (type === 'matched') {
            // All matched keywords are blue now
            badgeClass = 'border-blue-600 bg-blue-50 text-blue-700';
        }
        else if (type === 'missing') badgeClass = 'border-red-500 bg-red-50 text-red-700';
        else if (type === 'partial') badgeClass = 'border-amber-500 bg-amber-50 text-amber-700';
        else badgeClass = 'border-slate-300 bg-slate-50 text-slate-500';

        return (
            <div
                key={`${type}-${keyword.term}`}
                className={`group relative px-3 py-1 border-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${badgeClass} shadow-sm`}
            >
                <div className="flex items-center gap-2">
                    <span>{keyword.term}</span>
                    {type === 'matched' && keyword.status === 'unverified' && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-blue-500 text-white rounded font-bold">Skills Only</span>
                    )}
                </div>

                {/* Context Tooltip */}
                {keyword.context && keyword.context !== 'N/A' && keyword.context.trim().length > 0 && (
                    <div className="absolute bottom-full left-0 mb-3 w-64 hidden group-hover:block z-50 animate-fade-in">
                        <div className="bg-white border-2 border-blue-600/20 p-4 text-[10px] leading-relaxed normal-case font-bold text-slate-700 shadow-2xl rounded-xl min-w-[200px]">
                            {/* Frequency Stats */}
                            <div className="flex gap-4 mb-3 border-b border-blue-50 pb-2">
                                <div>
                                    <div className="text-[8px] uppercase text-slate-400 font-black tracking-wider">JD Mentions</div>
                                    <div className="text-lg font-black text-blue-600">{keyword.jdFrequency || 1}</div>
                                </div>
                                <div>
                                    <div className="text-[8px] uppercase text-slate-400 font-black tracking-wider">You Used</div>
                                    <div className={`text-lg font-black ${keyword.resumeFrequency && keyword.resumeFrequency > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                                        {keyword.resumeFrequency || 0}
                                    </div>
                                </div>
                            </div>

                            {keyword.context && keyword.context !== 'N/A' && (
                                <>
                                    <div className="text-blue-600 font-black mb-1 tracking-widest uppercase">Context:</div>
                                    <div>"{keyword.context}"</div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const groupByCategory = (keywords: Keyword[]) => {
        return keywords.reduce((acc, keyword) => {
            const cat = keyword.category || 'Other Skills';
            if (!acc[cat]) {
                acc[cat] = [];
            }
            acc[cat].push(keyword);
            return acc;
        }, {} as Record<string, Keyword[]>);
    };

    const matchedByCategory = groupByCategory(matched);
    const missingByCategory = groupByCategory(missing);
    const partialByCategory = groupByCategory(partial);
    const extraByCategory = groupByCategory(extra);

    return (
        <div className="space-y-8">
            {/* HUD Status Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="terminal-card bg-white p-4 md:p-6 border-blue-600/30 shadow-lg">
                    <div className="text-2xl md:text-3xl font-black text-blue-600 leading-none">{matched.length}</div>
                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 md:mt-3">Matched</div>
                </div>
                <div className="terminal-card bg-white p-4 md:p-6 border-amber-500/30 shadow-lg">
                    <div className="text-2xl md:text-3xl font-black text-amber-500 leading-none">{partial.length}</div>
                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 md:mt-3">Partial</div>
                </div>
                <div className="terminal-card bg-white p-4 md:p-6 border-red-500/30 shadow-lg">
                    <div className="text-2xl md:text-3xl font-black text-red-500 leading-none">{missing.length}</div>
                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 md:mt-3">Missing</div>
                </div>
                <div className="terminal-card bg-white p-4 md:p-6 border-slate-200 shadow-lg">
                    <div className="text-2xl md:text-3xl font-black text-slate-300 leading-none">{extra.length}</div>
                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 md:mt-3">Peripheral</div>
                </div>
            </div>

            {/* Keyword Sections */}
            <div className="space-y-8">
                {/* Matched */}
                {matched.length > 0 && (
                    <div className="terminal-card bg-white p-8 border-slate-200 shadow-xl uppercase">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-4 bg-blue-600" />
                            <h3 className="text-base font-semibold text-slate-900">Matched Keywords</h3>
                        </div>
                        <div className="space-y-8">
                            {Object.entries(matchedByCategory).map(([category, keywords]) => (
                                <div key={category} className="border-l-2 border-slate-50 pl-6">
                                    <div className="text-sm font-semibold text-blue-600 mb-4">
                                        {category}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {keywords.map(keyword => renderKeywordBadge(keyword, 'matched'))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing */}
                {missing.length > 0 && (
                    <div className="terminal-card bg-white p-8 border-red-100 shadow-xl uppercase">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-4 bg-red-500" />
                            <h3 className="text-base font-semibold text-red-600">Missing Keywords</h3>
                        </div>
                        <div className="space-y-8">
                            {Object.entries(missingByCategory).map(([category, keywords]) => (
                                <div key={category} className="border-l-2 border-red-50 pl-6">
                                    <div className="text-sm font-semibold text-red-500 mb-4">
                                        {category}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {keywords.map(keyword => renderKeywordBadge(keyword, 'missing'))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Partial */}
                {partial.length > 0 && (
                    <div className="terminal-card bg-white p-8 border-amber-100 shadow-xl uppercase">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-4 bg-amber-500" />
                            <h3 className="text-base font-semibold text-amber-600">Partial Matches</h3>
                        </div>
                        <div className="space-y-8">
                            {Object.entries(partialByCategory).map(([category, keywords]) => (
                                <div key={category} className="border-l-2 border-amber-50 pl-6">
                                    <div className="text-sm font-semibold text-amber-600 mb-4">
                                        {category}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {keywords.map(keyword => renderKeywordBadge(keyword, 'partial'))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
