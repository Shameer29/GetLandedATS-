'use client';

import { useEffect, useState } from 'react';
import { getScoreCategory } from '@/lib/ats-utils';

interface ScoreGaugeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function ScoreGauge({ score, size = 'lg', showLabel = true }: ScoreGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const category = getScoreCategory(score);

    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    const sizes = {
        sm: { width: 120, stroke: 8, fontSize: 'text-2xl' },
        md: { width: 160, stroke: 10, fontSize: 'text-3xl' },
        lg: { width: 200, stroke: 12, fontSize: 'text-5xl' },
    };

    const { width, stroke, fontSize } = sizes[size];
    const radius = (width - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    const getColor = () => {
        if (score >= 80) return '#2563eb'; // blue-600
        if (score >= 60) return '#3b82f6'; // blue-500
        if (score >= 40) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative" style={{ width, height: width }}>
                {/* Background circle */}
                <svg className="transform -rotate-90" width={width} height={width}>
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                        className="text-slate-100"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke={getColor()}
                        strokeWidth={stroke}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 8px ${getColor()}30)`,
                        }}
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-black tracking-tighter ${fontSize} text-slate-900`}>
                        {animatedScore}
                    </span>
                    <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase mt-[-4px]">Score</span>
                </div>
            </div>

            {showLabel && (
                <div className="text-center">
                    <div className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${category.className.includes('green') ? 'border-blue-600/20 text-blue-600 bg-blue-50' : category.className}`}>
                        {category.label}
                    </div>
                </div>
            )}
        </div>
    );
}
