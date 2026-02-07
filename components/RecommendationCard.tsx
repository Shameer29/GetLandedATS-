'use client';

import { Recommendation } from '@/types';

interface RecommendationCardProps {
    recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
    const getPriorityColor = () => {
        switch (recommendation.priority) {
            case 'high':
                return 'border-red-200 bg-red-50';
            case 'medium':
                return 'border-amber-200 bg-amber-50';
            case 'low':
                return 'border-blue-200 bg-blue-50';
        }
    };

    const getPriorityBadge = () => {
        const colors = {
            high: 'text-red-700 border-red-200 bg-white',
            medium: 'text-amber-700 border-amber-200 bg-white',
            low: 'text-blue-700 border-blue-200 bg-white',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 border-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${colors[recommendation.priority]}`}>
                {recommendation.priority.toUpperCase()} Priority
            </span>
        );
    };

    return (
        <div className={`terminal-card bg-white border-2 ${getPriorityColor()} p-6 md:p-8 group transition-all duration-300 hover:shadow-xl rounded-2xl`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0" />
                    <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{recommendation.title}</h4>
                </div>
                <div className="shrink-0">{getPriorityBadge()}</div>
            </div>

            {/* Description */}
            <p className="text-slate-600 mb-8 font-bold text-sm leading-relaxed border-l-4 border-slate-100 pl-6">{recommendation.description}</p>

            {/* Action Items */}
            <div className="mb-8">
                <h5 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Action Steps</h5>
                <ul className="space-y-4">
                    {recommendation.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-4 group/item">
                            <span className="text-[10px] text-blue-600 font-black mt-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Step {index + 1}</span>
                            <span className="text-sm text-slate-700 font-bold group-hover/item:text-blue-600 transition-colors">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Expected Impact HUD */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-4 h-1.5 rounded-full ${i <= (recommendation.priority === 'high' ? 3 : recommendation.priority === 'medium' ? 2 : 1) ? 'bg-blue-600' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-slate-500 pl-2">Expected Impact</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    Score Improvement: <span className="text-blue-600 font-bold">+{recommendation.expectedImpact} points</span>
                </div>
            </div>
        </div>
    );
}
