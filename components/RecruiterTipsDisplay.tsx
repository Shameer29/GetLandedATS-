'use client';

import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiChevronRight } from 'react-icons/fi';

interface RecruiterTip {
  title: string;
  status: 'pass' | 'warning' | 'fail';
  impact: 'high' | 'medium' | 'low';
  current: string;
  recommendation: string;
}

interface RecruiterTipsDisplayProps {
  tips: RecruiterTip[] | null;
}

export default function RecruiterTipsDisplay({ tips }: RecruiterTipsDisplayProps) {
  // Handle cases where tips is not an array
  if (!tips || !Array.isArray(tips) || tips.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No recruiter tips available</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'fail':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="text-xs px-2 py-0.5 bg-slate-900 text-white rounded">High Impact</span>;
      case 'medium':
        return <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">Medium</span>;
      case 'low':
        return <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-900">Recruiter Insights</h3>

      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div
            key={i}
            className={`border rounded-lg p-4 ${tip.status === 'pass' ? 'border-green-200 bg-green-50/50' :
              tip.status === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                'border-red-200 bg-red-50/50'
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(tip.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-900">{tip.title}</h4>
                  {getImpactLabel(tip.impact)}
                </div>
                <p className="text-sm text-slate-600 mb-2">{tip.current}</p>
                {tip.recommendation && tip.status !== 'pass' && (
                  <div className="flex items-start gap-2 text-sm text-slate-700 bg-white/50 rounded p-2">
                    <FiChevronRight className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span>{tip.recommendation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
