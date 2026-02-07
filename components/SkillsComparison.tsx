'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface SkillsComparisonProps {
  matched: Array<{ skill: string; importance: string; foundInResume: boolean; jdFrequency?: number; resumeFrequency?: number }>;
  missing: Array<{ skill: string; importance: string; foundInResume: boolean; jdFrequency?: number; resumeFrequency?: number }>;
  extra: Array<{ skill: string; importance: string; foundInResume: boolean; jdFrequency?: number; resumeFrequency?: number }>;
}

export default function SkillsComparison({ matched, missing, extra }: SkillsComparisonProps) {
  const [sortBy, setSortBy] = useState<'importance' | 'status' | 'frequency'>('importance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const allSkills = [
    ...matched.map(s => ({ ...s, status: 'matched' as const })),
    ...missing.map(s => ({ ...s, status: 'missing' as const })),
    ...extra.map(s => ({ ...s, status: 'extra' as const })),
  ];

  // ... (keeping sort logic mostly same but adding frequency sort support if needed, simple for now)
  const getImportanceOrder = (imp: string) => {
    if (imp === 'required') return 3;
    if (imp === 'preferred') return 2;
    return 1;
  };

  const sortedSkills = [...allSkills].sort((a, b) => {
    if (sortBy === 'importance') {
      const diff = getImportanceOrder(b.importance) - getImportanceOrder(a.importance);
      return sortDir === 'desc' ? diff : -diff;
    }
    const order = { matched: 1, missing: 2, extra: 3 };
    const diff = order[a.status] - order[b.status];
    return sortDir === 'desc' ? -diff : diff;
  });

  const toggleSort = (col: 'importance' | 'status' | 'frequency') => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const SortIcon = sortDir === 'desc' ? FiArrowDown : FiArrowUp;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">Skills Gap Analysis</h3>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1 text-green-600 font-bold">
            <FiCheck className="w-3 h-3" /> {matched.length} Found
          </span>
          <span className="flex items-center gap-1 text-red-600 font-bold">
            <FiX className="w-3 h-3" /> {missing.length} Missing
          </span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 w-1/3">Skill</th>
              <th className="text-center px-4 py-3 w-24">JD Count</th>
              <th className="text-center px-4 py-3 w-24">You Used</th>
              <th className="text-left px-4 py-3 w-32 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('importance')}>
                <span className="flex items-center gap-1">Importance {sortBy === 'importance' && <SortIcon className="w-3 h-3" />}</span>
              </th>
              <th className="text-right px-4 py-3 w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedSkills.map((skill, i) => (
              <tr key={i} className={`hover:bg-slate-50 transition-colors ${skill.status === 'missing' && skill.importance === 'required' ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium text-slate-900">{skill.skill}</td>
                <td className="px-4 py-3 text-center font-mono text-slate-500">
                  {skill.jdFrequency || (skill.status === 'extra' ? '-' : 1)}
                </td>
                <td className="px-4 py-3 text-center font-mono">
                  <span className={`${skill.resumeFrequency && skill.resumeFrequency > 0 ? 'text-green-600 font-bold' : 'text-slate-300'}`}>
                    {skill.resumeFrequency || 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${skill.importance === 'required' ? 'bg-slate-900 text-white' :
                      skill.importance === 'preferred' ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {skill.importance}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {skill.status === 'matched' && <span className="inline-flex items-center text-green-600 font-bold text-xs"><FiCheck className="mr-1" /> Found</span>}
                  {skill.status === 'missing' && <span className="inline-flex items-center text-red-500 font-bold text-xs"><FiX className="mr-1" /> Missing</span>}
                  {skill.status === 'extra' && <span className="inline-flex items-center text-blue-400 font-bold text-xs"><FiPlus className="mr-1" /> Bonus</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
