'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiChevronDown, FiFilter, FiPlus } from 'react-icons/fi';

interface SkillMatch {
    skill: string;
    importance: 'required' | 'preferred' | 'bonus';
    foundInResume: boolean;
    jdFrequency?: number;
    resumeFrequency?: number;
    proof?: string;
}

interface SkillsTableProps {
    matchedSkills: SkillMatch[];
    missingSkills: SkillMatch[];
    extraSkills?: SkillMatch[];
}

export default function SkillsTable({ matchedSkills, missingSkills, extraSkills = [] }: SkillsTableProps) {
    const [filter, setFilter] = useState<'all' | 'matched' | 'missing'>('all');
    const [copiedSkill, setCopiedSkill] = useState<string | null>(null);

    const handleCopy = async (skill: string) => {
        await navigator.clipboard.writeText(skill);
        setCopiedSkill(skill);
        setTimeout(() => setCopiedSkill(null), 2000);
    };

    const handleCopyAll = async (type: 'matched' | 'missing') => {
        const skills = type === 'matched'
            ? matchedSkills.map(s => s.skill).join(', ')
            : missingSkills.map(s => s.skill).join(', ');
        await navigator.clipboard.writeText(skills);
        setCopiedSkill(type);
        setTimeout(() => setCopiedSkill(null), 2000);
    };

    const getImportanceBadge = (importance: string) => {
        switch (importance) {
            case 'required':
                return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">MUST HAVE</span>;
            case 'preferred':
                return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">PREFERRED</span>;
            default:
                return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">BONUS</span>;
        }
    };

    const filteredMatched = filter === 'missing' ? [] : matchedSkills;
    const filteredMissing = filter === 'matched' ? [] : missingSkills;

    const requiredMissing = missingSkills.filter(s => s.importance === 'required');
    const matchPercentage = Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100) || 0;

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-green-700">{matchedSkills.length}</p>
                    <p className="text-sm text-green-600 font-medium">Skills Matched</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-red-700">{missingSkills.length}</p>
                    <p className="text-sm text-red-600 font-medium">Skills Missing</p>
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-violet-700">{matchPercentage}%</p>
                    <p className="text-sm text-violet-600 font-medium">Match Rate</p>
                </div>
            </div>

            {/* Critical Alert */}
            {requiredMissing.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-red-800 flex items-center gap-2">
                            ⚠️ {requiredMissing.length} REQUIRED Skills Missing!
                        </h4>
                        <button
                            onClick={() => handleCopyAll('missing')}
                            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {copiedSkill === 'missing' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                            {copiedSkill === 'missing' ? 'Copied!' : 'Copy All Missing'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {requiredMissing.map(skill => (
                            <button
                                key={skill.skill}
                                onClick={() => handleCopy(skill.skill)}
                                className="group flex items-center gap-1 px-3 py-1.5 bg-white border border-red-300 rounded-lg text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                                {skill.skill}
                                <FiPlus className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
                {[
                    { id: 'all', label: 'All Skills', count: matchedSkills.length + missingSkills.length },
                    { id: 'matched', label: 'Matched', count: matchedSkills.length },
                    { id: 'missing', label: 'Missing', count: missingSkills.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as 'all' | 'matched' | 'missing')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${filter === tab.id
                                ? 'border-violet-600 text-violet-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Skills Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Skill</th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">JD Count</th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Your Count</th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredMatched.map((skill, i) => (
                            <tr key={`m-${i}`} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-900">{skill.skill}</td>
                                <td className="px-4 py-3 text-center">{getImportanceBadge(skill.importance)}</td>
                                <td className="px-4 py-3 text-center text-slate-600">{skill.jdFrequency || 1}</td>
                                <td className="px-4 py-3 text-center text-slate-600">{skill.resumeFrequency || 1}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ MATCHED</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="text-green-600 text-sm">You have this!</span>
                                </td>
                            </tr>
                        ))}
                        {filteredMissing.map((skill, i) => (
                            <tr key={`x-${i}`} className="hover:bg-red-50 transition-colors bg-red-50/30">
                                <td className="px-4 py-3 font-medium text-red-800">{skill.skill}</td>
                                <td className="px-4 py-3 text-center">{getImportanceBadge(skill.importance)}</td>
                                <td className="px-4 py-3 text-center text-slate-600">{skill.jdFrequency || 1}</td>
                                <td className="px-4 py-3 text-center text-red-600 font-bold">0</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">✗ MISSING</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleCopy(skill.skill)}
                                        className="flex items-center gap-1 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors mx-auto"
                                    >
                                        {copiedSkill === skill.skill ? <FiCheck className="w-3 h-3" /> : <FiPlus className="w-3 h-3" />}
                                        {copiedSkill === skill.skill ? 'Copied!' : 'Add to CV'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
