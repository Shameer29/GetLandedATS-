'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MatchPercentageProps {
    score: number;
    breakdown: {
        keywordMatch: number;
        formatCompliance: number;
        contentQuality: number;
        optimization: number;
    };
}

export default function MatchPercentage({ score, breakdown }: MatchPercentageProps) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        // Animated counting effect
        const duration = 2000;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    const getScoreLabel = (score: number) => {
        if (score >= 80) return { text: 'Excellent Match', icon: '✓', color: 'text-blue-600' };
        if (score >= 60) return { text: 'Good Match', icon: '✓', color: 'text-blue-500' };
        if (score >= 40) return { text: 'Needs Improvement', icon: '!', color: 'text-amber-500' };
        return { text: 'Poor Match', icon: '×', color: 'text-red-500' };
    };

    const scoreInfo = getScoreLabel(score);
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="terminal-card bg-white p-6 md:p-12 border-slate-200 shadow-xl shadow-slate-200/50"
        >
            <div className="text-center">
                <h3 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-[0.4em]">Match Analysis</h3>
                <p className="text-sm font-bold text-slate-900 mb-12 uppercase tracking-widest">Resume Match Score</p>

                {/* Circular Power Meter */}
                <div className="relative inline-flex items-center justify-center mb-12 transform scale-75 sm:scale-100">
                    <svg className="transform -rotate-90" width="280" height="280" viewBox="0 0 280 280">
                        {/* Background ring */}
                        <circle
                            cx="140"
                            cy="140"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-slate-100"
                        />
                        {/* Segmented pulses */}
                        <circle
                            cx="140"
                            cy="140"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray="4 4"
                            className="text-slate-200 opacity-40"
                        />
                        {/* Progress meter */}
                        <motion.circle
                            cx="140"
                            cy="140"
                            r="120"
                            stroke="#2563eb"
                            strokeWidth="14"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 2, ease: 'easeOut' }}
                            style={{ filter: 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.2))' }}
                        />
                    </svg>

                    {/* Score Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] font-black text-blue-600 mb-1 tracking-[0.3em]">Score</div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            className="text-8xl font-black text-slate-900 tracking-tighter"
                        >
                            {displayScore}
                        </motion.div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase bg-slate-50 border border-slate-100 ${scoreInfo.color}`}>
                                {scoreInfo.text}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tactical Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    <ScoreBreakdownItem label="Keywords" score={breakdown.keywordMatch} icon="KEY" delay={0.1} />
                    <ScoreBreakdownItem label="Format" score={breakdown.formatCompliance} icon="FRM" delay={0.2} />
                    <ScoreBreakdownItem label="Content" score={breakdown.contentQuality} icon="CNT" delay={0.3} />
                    <ScoreBreakdownItem label="Optimization" score={breakdown.optimization} icon="OPT" delay={0.4} />
                </div>
            </div>
        </motion.div>
    );
}

interface ScoreBreakdownItemProps {
    label: string;
    score: number;
    icon: string;
    delay: number;
}

function ScoreBreakdownItem({ label, score, icon, delay }: ScoreBreakdownItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="bg-slate-50 border border-slate-100 p-6 rounded-xl transition-all hover:bg-white hover:shadow-lg group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 border-2 border-slate-200 px-1.5 py-0.5 rounded group-hover:border-blue-500 group-hover:text-blue-600 transition-colors uppercase">{icon}</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-base font-black text-slate-900 tracking-tighter">{score}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full relative overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ delay: delay + 0.2, duration: 0.6 }}
                    className="bg-blue-600 h-full rounded-full"
                />
            </div>
        </motion.div>
    );
}
