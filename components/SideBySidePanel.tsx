'use client';

import { useState, useMemo, useCallback } from 'react';
import { FiCopy, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import type { SideBySideData } from '@/lib/ats-engine';

interface SideBySidePanelProps {
    resumeText: string;
    jobDescription: string;
    sideBySide: SideBySideData;
}

export default function SideBySidePanel({ resumeText, jobDescription, sideBySide }: SideBySidePanelProps) {
    const [showHighlights, setShowHighlights] = useState(true);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [showAllMatched, setShowAllMatched] = useState(false);
    const [showAllMissing, setShowAllMissing] = useState(false);

    const handleCopy = async (text: string, type: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedText(type);
        setTimeout(() => setCopiedText(null), 2000);
    };

    // Build highlight map
    const highlightMap = useMemo(() => {
        const matchedSet = new Set(sideBySide.matchedKeywords.map(k => k.toLowerCase()));
        const missingSet = new Set(sideBySide.missingKeywords.map(k => k.toLowerCase()));

        sideBySide.matchedKeywords.forEach(phrase => {
            phrase.split(/\s+/).forEach(w => {
                if (w.length > 2) matchedSet.add(w.toLowerCase());
            });
        });

        sideBySide.missingKeywords.forEach(phrase => {
            phrase.split(/\s+/).forEach(w => {
                if (w.length > 2) missingSet.add(w.toLowerCase());
            });
        });

        return { matchedSet, missingSet };
    }, [sideBySide.matchedKeywords, sideBySide.missingKeywords]);

    // Create highlighted content
    const createHighlightedContent = useCallback((text: string, isResume: boolean) => {
        if (!showHighlights) return <span>{text}</span>;

        const allMatchedKeywords = [...sideBySide.matchedKeywords].sort((a, b) => b.length - a.length);
        const allMissingKeywords = [...sideBySide.missingKeywords].sort((a, b) => b.length - a.length);

        const highlights: { start: number; end: number; type: 'matched' | 'missing' }[] = [];
        const textLower = text.toLowerCase();

        allMatchedKeywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            let pos = 0;
            while ((pos = textLower.indexOf(keywordLower, pos)) !== -1) {
                const before = pos > 0 ? textLower[pos - 1] : ' ';
                const after = pos + keywordLower.length < textLower.length ? textLower[pos + keywordLower.length] : ' ';
                if (/[\s.,!?;:()'"\-\/\\]/.test(before) && /[\s.,!?;:()'"\-\/\\]/.test(after) || pos === 0 || pos + keywordLower.length === textLower.length) {
                    highlights.push({ start: pos, end: pos + keyword.length, type: 'matched' });
                }
                pos += 1;
            }
        });

        if (!isResume) {
            allMissingKeywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                let pos = 0;
                while ((pos = textLower.indexOf(keywordLower, pos)) !== -1) {
                    const before = pos > 0 ? textLower[pos - 1] : ' ';
                    const after = pos + keywordLower.length < textLower.length ? textLower[pos + keywordLower.length] : ' ';
                    if (/[\s.,!?;:()'"\-\/\\]/.test(before) && /[\s.,!?;:()'"\-\/\\]/.test(after) || pos === 0 || pos + keywordLower.length === textLower.length) {
                        const alreadyHighlighted = highlights.some(h => (pos >= h.start && pos < h.end) || (pos + keyword.length > h.start && pos + keyword.length <= h.end));
                        if (!alreadyHighlighted) {
                            highlights.push({ start: pos, end: pos + keyword.length, type: 'missing' });
                        }
                    }
                    pos += 1;
                }
            });
        }

        highlights.sort((a, b) => a.start - b.start);

        const cleanHighlights: typeof highlights = [];
        let lastEnd = 0;
        for (const h of highlights) {
            if (h.start >= lastEnd) {
                cleanHighlights.push(h);
                lastEnd = h.end;
            }
        }

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        cleanHighlights.forEach((h, i) => {
            if (h.start > lastIndex) {
                parts.push(<span key={`text-${i}`}>{text.slice(lastIndex, h.start)}</span>);
            }
            const highlightedText = text.slice(h.start, h.end);
            if (h.type === 'matched') {
                parts.push(<mark key={`match-${i}`} className="bg-green-200 text-green-900 px-0.5 rounded">{highlightedText}</mark>);
            } else {
                parts.push(<mark key={`miss-${i}`} className="bg-red-200 text-red-900 px-0.5 rounded">{highlightedText}</mark>);
            }
            lastIndex = h.end;
        });

        if (lastIndex < text.length) {
            parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
        }

        return <>{parts}</>;
    }, [showHighlights, sideBySide.matchedKeywords, sideBySide.missingKeywords]);

    const handleCopyMissing = async () => {
        await navigator.clipboard.writeText(sideBySide.missingKeywords.join(', '));
        setCopiedText('missing');
        setTimeout(() => setCopiedText(null), 2000);
    };

    const matchRate = sideBySide.matchedKeywords.length > 0
        ? Math.round((sideBySide.matchedKeywords.length / (sideBySide.matchedKeywords.length + sideBySide.missingKeywords.length)) * 100)
        : 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Side-by-Side Comparison</h2>
                    <p className="text-sm text-slate-600">Keywords highlighted in both documents</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-lg ${matchRate >= 70 ? 'bg-green-50 text-green-700 border border-green-100' :
                        matchRate >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {matchRate}% Keyword Match
                    </span>
                    <button
                        onClick={() => setShowHighlights(!showHighlights)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        {showHighlights ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        {showHighlights ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            {/* Legend and Keywords */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-green-200 border border-green-300"></span>
                        <span className="text-sm text-slate-600">{sideBySide.matchedKeywords.length} Matched</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-red-200 border border-red-300"></span>
                        <span className="text-sm text-slate-600">{sideBySide.missingKeywords.length} Missing</span>
                    </div>
                    <button
                        onClick={handleCopyMissing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors ml-auto"
                    >
                        {copiedText === 'missing' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                        {copiedText === 'missing' ? 'Copied' : 'Copy Missing'}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Matched Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                            {(showAllMatched ? sideBySide.matchedKeywords : sideBySide.matchedKeywords.slice(0, 12)).map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                                    {kw}
                                </span>
                            ))}
                            {sideBySide.matchedKeywords.length > 12 && (
                                <button
                                    onClick={() => setShowAllMatched(!showAllMatched)}
                                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded cursor-pointer transition-colors"
                                >
                                    {showAllMatched ? 'Show less' : `+${sideBySide.matchedKeywords.length - 12} more`}
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Missing Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                            {(showAllMissing ? sideBySide.missingKeywords : sideBySide.missingKeywords.slice(0, 12)).map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded border border-red-200">
                                    {kw}
                                </span>
                            ))}
                            {sideBySide.missingKeywords.length > 12 && (
                                <button
                                    onClick={() => setShowAllMissing(!showAllMissing)}
                                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded cursor-pointer transition-colors"
                                >
                                    {showAllMissing ? 'Show less' : `+${sideBySide.missingKeywords.length - 12} more`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Side by Side Panels */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Resume Panel */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">Your Resume</h4>
                        <button
                            onClick={() => handleCopy(resumeText, 'resume')}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors"
                        >
                            {copiedText === 'resume' ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                            {copiedText === 'resume' ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {createHighlightedContent(resumeText, true)}
                        </div>
                    </div>
                </div>

                {/* Job Description Panel */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">Job Description</h4>
                        <button
                            onClick={() => handleCopy(jobDescription, 'jd')}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors"
                        >
                            {copiedText === 'jd' ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                            {copiedText === 'jd' ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {createHighlightedContent(jobDescription, false)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
