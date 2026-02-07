'use client';

import type { MatchRateBreakdown } from '@/lib/ats-engine';

interface MatchRateBarProps {
    matchRate: MatchRateBreakdown;
}

export default function MatchRateBar({ matchRate }: MatchRateBarProps) {
    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-700';
        if (score >= 50) return 'text-amber-700';
        return 'text-red-700';
    };

    const getBarColor = (score: number) => {
        if (score >= 70) return 'bg-green-600';
        if (score >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getStatus = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Needs Work';
    };

    const scores = [
        { label: 'Hard Skills', value: matchRate.hardSkills },
        { label: 'Soft Skills', value: matchRate.softSkills },
        { label: 'Searchability', value: matchRate.searchability },
        { label: 'Formatting', value: matchRate.formatting },
    ];

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            {/* Main Score */}
            <div className="p-6 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Overall Match Score</p>
                        <div className="flex items-baseline gap-3">
                            <span className={`text-4xl font-bold ${getScoreColor(matchRate.overall)}`}>
                                {matchRate.overall}%
                            </span>
                            <span className={`text-sm font-medium px-2 py-0.5 rounded ${matchRate.overall >= 70 ? 'bg-green-100 text-green-800' :
                                    matchRate.overall >= 50 ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {getStatus(matchRate.overall)}
                            </span>
                        </div>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-slate-200"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${matchRate.overall * 2.01} 201`}
                                strokeLinecap="round"
                                className={matchRate.overall >= 70 ? 'text-green-600' : matchRate.overall >= 50 ? 'text-amber-500' : 'text-red-500'}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-900">{matchRate.overall}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {scores.map((score) => (
                    <div key={score.label}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-slate-500">{score.label}</span>
                            <span className={`text-sm font-semibold ${getScoreColor(score.value)}`}>
                                {score.value}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${getBarColor(score.value)}`}
                                style={{ width: `${score.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
