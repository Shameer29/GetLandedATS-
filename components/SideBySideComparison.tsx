'use client';

import { useMemo, useState } from 'react';
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiCheckCircle } from 'react-icons/fi';

interface SkillMatch {
    skill: string;
    importance: 'required' | 'preferred' | 'bonus';
    foundInResume: boolean;
    jdFrequency?: number;
    resumeFrequency?: number;
    context?: string;
}

interface SideBySideComparisonProps {
    resumeText: string;
    jobDescription: string;
    matchedSkills: SkillMatch[];
    missingSkills: SkillMatch[];
}

export default function SideBySideComparison({
    resumeText,
    jobDescription,
    matchedSkills,
    missingSkills
}: SideBySideComparisonProps) {
    const [copiedSkill, setCopiedSkill] = useState<string | null>(null);
    const [showAllMissing, setShowAllMissing] = useState(false);

    // Create highlighted text with matched/missing keywords
    const highlightedResume = useMemo(() => {
        let text = resumeText;
        const highlights: { text: string; type: 'matched' | 'missing' }[] = [];

        // First pass - find all matches
        matchedSkills.forEach(skill => {
            try {
                const regex = createSkillRegex(skill.skill);
                text = text.replace(regex, `<mark class="bg-emerald-200 text-emerald-900 px-1 rounded">${skill.skill}</mark>`);
            } catch (e) { console.warn('Regex error', e); }
        });

        return text;
    }, [resumeText, matchedSkills]);

    const highlightedJD = useMemo(() => {
        let text = jobDescription;

        // COMBINED SORT: Merge all skills and sort by length DESC match to prevent "CSS" highlighting inside "Tailwind CSS"
        const allSkills = [
            ...matchedSkills.map(s => ({ ...s, type: 'matched' })),
            ...missingSkills.map(s => ({ ...s, type: 'missing' }))
        ].sort((a, b) => b.skill.length - a.skill.length);

        allSkills.forEach(skill => {
            try {
                const regex = createSkillRegex(skill.skill);
                // Matched = Green, Missing = Red
                const colorClass = skill.type === 'matched'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-red-200 text-red-900';

                // Use a replace function to avoid replacing inside existing HTML tags
                text = text.replace(regex, (match) => {
                    // Crude check: if it looks like we are inside a tag (or overlap), skip
                    // Realistically, sorting by length handles the main overlap.
                    // This check prevents re-highlighting something that was just highlighted.
                    if (match.includes('<mark')) return match;
                    return `<mark class="${colorClass} px-1 rounded">${match}</mark>`;
                });
            } catch (e) { }
        });

        return text;
    }, [jobDescription, matchedSkills, missingSkills]);

    const handleCopySkill = async (skill: string) => {
        await navigator.clipboard.writeText(skill);
        setCopiedSkill(skill);
        setTimeout(() => setCopiedSkill(null), 2000);
    };

    const handleCopyAllMissing = async () => {
        const allMissing = missingSkills.map(s => s.skill).join(', ');
        await navigator.clipboard.writeText(allMissing);
        setCopiedSkill('all');
        setTimeout(() => setCopiedSkill(null), 2000);
    };

    const displayMissing = showAllMissing ? missingSkills : missingSkills.slice(0, 16);

    return (
        <div className="space-y-6">
            {/* Skills Summary Summary at Top */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Matched Skills */}
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <h3 className="font-semibold text-emerald-900">Matched ({matchedSkills.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {matchedSkills.map((skill, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-white text-emerald-700 border border-emerald-100">
                                <FiCheck className="w-3.5 h-3.5 mr-1" />
                                {skill.skill}
                            </span>
                        ))}
                        {matchedSkills.length === 0 && (
                            <span className="text-emerald-600 text-sm italic">No matched skills found yet.</span>
                        )}
                    </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <h3 className="font-semibold text-red-900">Missing ({missingSkills.length})</h3>
                        </div>
                        {missingSkills.length > 0 && (
                            <button
                                onClick={handleCopyAllMissing}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-red-100 text-red-700 text-xs font-medium rounded border border-red-200 transition-colors"
                            >
                                {copiedSkill === 'all' ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                                {copiedSkill === 'all' ? 'Copied' : 'Copy All'}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {displayMissing.map((skill, i) => (
                            <button
                                key={i}
                                onClick={() => handleCopySkill(skill.skill)}
                                className="group flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-100 text-red-700 border border-red-100 rounded-md text-sm font-medium transition-colors"
                            >
                                {skill.skill}
                                {copiedSkill === skill.skill ? (
                                    <FiCheck className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                    <FiCopy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                )}
                            </button>
                        ))}
                        {missingSkills.length > 16 && !showAllMissing && (
                            <button
                                onClick={() => setShowAllMissing(true)}
                                className="text-xs text-red-700 hover:text-red-900 font-medium flex items-center gap-1 px-2"
                            >
                                +{missingSkills.length - 16} more
                            </button>
                        )}
                        {missingSkills.length === 0 && (
                            <span className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4" /> All skills matched!
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Side by Side Panels */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Resume Panel */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Your Resume</h3>
                    </div>
                    <div
                        className="p-4 max-h-[400px] overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono"
                        dangerouslySetInnerHTML={{ __html: highlightedResume }}
                    />
                </div>

                {/* JD Panel */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Job Description</h3>
                    </div>
                    <div
                        className="p-4 max-h-[400px] overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono"
                        dangerouslySetInnerHTML={{ __html: highlightedJD }}
                    />
                </div>
            </div>
        </div>
    );
}

// Helper to create robust regex for skills (handling C++, .NET, whitespace, etc.)
function createSkillRegex(skill: string): RegExp {
    // First escape special regex characters
    let escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace spaces with flexible whitespace pattern (matches 1+ whitespace, including &nbsp; HTML)
    escaped = escaped.replace(/\s+/g, '[\\s\\u00A0]+');

    // Check if skill starts/ends with word char
    const startsWithWord = /^[a-zA-Z0-9]/.test(skill);
    const endsWithWord = /[a-zA-Z0-9]$/.test(skill);

    // If starts with symbol (e.g. .NET), don't use \b at start
    const startBoundary = startsWithWord ? '\\b' : '(?<=^|[\\s.,;!?()"\'\\[\\]{}-])';

    // If ends with symbol (e.g. C++), don't use \b at end
    const endBoundary = endsWithWord ? '\\b' : '(?=$|[\\s.,;!?()"\'\\[\\]{}-])';

    return new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'gi');
}
