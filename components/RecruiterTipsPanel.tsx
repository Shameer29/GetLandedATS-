'use client';

import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import type { RecruiterTip } from '@/lib/ats-engine';

interface RecruiterTipsPanelProps {
    tips: RecruiterTip[];
}

export default function RecruiterTipsPanel({ tips }: RecruiterTipsPanelProps) {
    const passCount = tips.filter(t => t.status === 'pass').length;
    const failCount = tips.filter(t => t.status === 'fail').length;
    const warningCount = tips.filter(t => t.status === 'warning').length;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass':
                return <FiCheckCircle className="w-5 h-5 text-green-600" />;
            case 'fail':
                return <FiXCircle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <FiAlertTriangle className="w-5 h-5 text-amber-600" />;
            default:
                return <FiInfo className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'pass':
                return 'bg-green-50 border-green-200';
            case 'fail':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-amber-50 border-amber-200';
            default:
                return 'bg-slate-50 border-slate-200';
        }
    };

    // Group tips by category
    const groupedTips = tips.reduce((acc, tip) => {
        if (!acc[tip.category]) acc[tip.category] = [];
        acc[tip.category].push(tip);
        return acc;
    }, {} as Record<string, RecruiterTip[]>);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Recruiter Tips</h3>
                        <p className="text-sm text-slate-500">What recruiters look for in your resume</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <FiCheckCircle className="w-4 h-4" /> {passCount} Pass
                        </span>
                        {warningCount > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                <FiAlertTriangle className="w-4 h-4" /> {warningCount} Warning
                            </span>
                        )}
                        {failCount > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                <FiXCircle className="w-4 h-4" /> {failCount} Fail
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tips by Category */}
            <div className="p-4 space-y-6">
                {Object.entries(groupedTips).map(([category, categoryTips]) => (
                    <div key={category}>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                            {category}
                        </h4>
                        <div className="space-y-3">
                            {categoryTips.map((tip, i) => (
                                <div
                                    key={i}
                                    className={`p-4 rounded-xl border-2 ${getStatusBg(tip.status)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getStatusIcon(tip.status)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900">{tip.tip}</p>
                                            <p className="text-sm text-slate-600 mt-1">{tip.detail}</p>
                                            {tip.fix && tip.status !== 'pass' && (
                                                <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200">
                                                    <p className="text-sm">
                                                        <span className="font-medium text-violet-700">Fix: </span>
                                                        {tip.fix}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {tips.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No recruiter tips available
                </div>
            )}
        </div>
    );
}
