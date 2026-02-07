'use client';

import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiShield } from 'react-icons/fi';

interface ATSCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  recommendation?: string;
}

interface ATSCompatibilityDisplayProps {
  compatibility: {
    overall: 'good' | 'fair' | 'poor';
    checks: ATSCheck[];
  };
}

export default function ATSCompatibilityDisplay({ compatibility }: ATSCompatibilityDisplayProps) {
  const getOverallStatus = () => {
    switch (compatibility.overall) {
      case 'good':
        return { icon: FiShield, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'ATS Compatible' };
      case 'fair':
        return { icon: FiShield, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Minor Issues' };
      case 'poor':
        return { icon: FiShield, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Needs Improvement' };
      default:
        return { icon: FiShield, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Unknown' };
    }
  };

  const overallStatus = getOverallStatus();
  const OverallIcon = overallStatus.icon;

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <FiAlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'fail':
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`${overallStatus.bg} ${overallStatus.border} border rounded-lg p-4`}>
        <div className="flex items-center gap-3">
          <OverallIcon className={`w-8 h-8 ${overallStatus.color}`} />
          <div>
            <h3 className={`text-lg font-semibold ${overallStatus.color}`}>{overallStatus.label}</h3>
            <p className="text-sm text-slate-600">
              {compatibility.overall === 'good'
                ? 'Your resume should parse correctly in most ATS systems.'
                : compatibility.overall === 'fair'
                  ? 'Some ATS systems may have trouble parsing your resume.'
                  : 'Your resume may not parse correctly in ATS systems.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Individual Checks */}
      {compatibility.checks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-900">Compatibility Checks</h4>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
            {compatibility.checks.map((check, i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <div className="mt-0.5">
                  {getCheckIcon(check.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-slate-900">{check.name}</h5>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{check.message}</p>
                  {check.recommendation && (
                    <p className="text-xs text-slate-500 mt-1 italic">{check.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
