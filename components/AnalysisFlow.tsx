'use client';

import { FiLoader } from 'react-icons/fi';

interface AnalysisFlowProps {
    status: string;
    progress: number;
}

export default function AnalysisFlow({ status, progress }: AnalysisFlowProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div
                    className="absolute inset-0 border-4 border-slate-900 rounded-full animate-spin"
                    style={{
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                    }}
                ></div>
            </div>
            <p className="text-slate-700 font-medium mb-2">{status}</p>
            <p className="text-sm text-slate-400">This may take a moment...</p>
        </div>
    );
}
