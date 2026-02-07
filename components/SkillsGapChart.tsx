'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiTrendingUp, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface SkillCategory {
    category: string;
    required: number;
    possessed: number;
    gap: number;
}

interface SkillsGapChartProps {
    matchedKeywords: Array<{ term: string; category: string; importance: string }>;
    missingKeywords: Array<{ term: string; category: string; importance: string }>;
    partialKeywords?: Array<{ term: string; category: string; importance: string }>;
}

export default function SkillsGapChart({ matchedKeywords, missingKeywords, partialKeywords = [] }: SkillsGapChartProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // Calculate skill gaps
    const skillCategories = calculateSkillGaps(matchedKeywords, missingKeywords, partialKeywords);

    // Calculate overall match
    const totalRequired = skillCategories.reduce((sum, cat) => sum + cat.required, 0);
    const totalPossessed = skillCategories.reduce((sum, cat) => sum + cat.possessed, 0);
    const overallMatch = totalRequired > 0 ? Math.round((totalPossessed / totalRequired) * 100) : 0;

    // Categorize by performance
    const strongAreas = skillCategories.filter(cat => cat.possessed / cat.required >= 0.8);
    const improvingAreas = skillCategories.filter(cat => {
        const ratio = cat.possessed / cat.required;
        return ratio >= 0.4 && ratio < 0.8;
    });
    const gapAreas = skillCategories.filter(cat => cat.possessed / cat.required < 0.4);

    const getStatusIcon = (percentage: number) => {
        if (percentage >= 80) return <FiCheckCircle className="text-green-500 w-5 h-5" />;
        if (percentage >= 40) return <FiTrendingUp className="text-amber-500 w-5 h-5" />;
        return <FiAlertCircle className="text-red-500 w-5 h-5" />;
    };

    const getStatusLabel = (percentage: number) => {
        if (percentage >= 80) return { text: 'Strong', color: 'text-green-600 bg-green-50 border-green-200' };
        if (percentage >= 40) return { text: 'Improving', color: 'text-amber-600 bg-amber-50 border-amber-200' };
        return { text: 'Needs Attention', color: 'text-red-600 bg-red-50 border-red-200' };
    };

    const toggleCategory = (category: string) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg border border-slate-200 p-6 md:p-10 shadow-md"
        >
            {/* Header */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Skills Analysis</h3>
                <p className="text-sm text-slate-600">How your skills match the job requirements</p>
            </div>

            {/* Overall Match */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm text-slate-600 mb-1">Overall Skills Match</div>
                        <div className="text-4xl font-bold text-blue-600">{overallMatch}%</div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                <span className="text-slate-700">{strongAreas.length} Strong</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiTrendingUp className="text-amber-500" />
                                <span className="text-slate-700">{improvingAreas.length} Improving</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiAlertCircle className="text-red-500" />
                                <span className="text-slate-700">{gapAreas.length} Gap{gapAreas.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-white rounded-full overflow-hidden border border-blue-200">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overallMatch}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    />
                </div>
            </div>

            {/* Skill Categories */}
            <div className="space-y-4">
                {skillCategories.map((category, idx) => {
                    const percentage = category.required > 0
                        ? Math.round((category.possessed / category.required) * 100)
                        : 0;
                    const status = getStatusLabel(percentage);
                    const isExpanded = expandedCategory === category.category;

                    // Get specific skills for this category
                    const categoryMatched = matchedKeywords.filter(k => k.category === category.category);
                    const categoryMissing = missingKeywords.filter(k => k.category === category.category);
                    const categoryPartial = partialKeywords.filter(k => k.category === category.category);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => toggleCategory(category.category)}
                                className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(percentage)}
                                        <h4 className="text-lg font-semibold text-slate-900">{category.category}</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                                            {status.text}
                                        </span>
                                        <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
                                        {isExpanded ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' :
                                                percentage >= 40 ? 'bg-amber-500' :
                                                    'bg-red-500'
                                            }`}
                                    />
                                </div>

                                <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                                    <span>{category.possessed} of {category.required} skills matched</span>
                                    {category.gap > 0 && (
                                        <span className="text-red-600 font-medium">• {category.gap} missing</span>
                                    )}
                                </div>
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-200 bg-slate-50 p-6"
                                >
                                    {/* Matched Skills */}
                                    {categoryMatched.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FiCheckCircle className="text-green-500 w-4 h-4" />
                                                <h5 className="text-sm font-semibold text-slate-900">Matched Skills</h5>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {categoryMatched.map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200"
                                                    >
                                                        {skill.term}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Partial Skills */}
                                    {categoryPartial.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FiTrendingUp className="text-amber-500 w-4 h-4" />
                                                <h5 className="text-sm font-semibold text-slate-900">Partial Matches</h5>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {categoryPartial.map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-200"
                                                    >
                                                        {skill.term}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Missing Skills */}
                                    {categoryMissing.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <FiAlertCircle className="text-red-500 w-4 h-4" />
                                                <h5 className="text-sm font-semibold text-slate-900">Missing Skills</h5>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {categoryMissing.map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200"
                                                    >
                                                        {skill.term}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// Helper function to calculate skill gaps
function calculateSkillGaps(
    matched: Array<{ term: string; category: string; importance: string }>,
    missing: Array<{ term: string; category: string; importance: string }>,
    partial: Array<{ term: string; category: string; importance: string }>
): SkillCategory[] {
    const categories = new Map<string, SkillCategory>();

    // Process matched skills
    matched.forEach(skill => {
        if (!categories.has(skill.category)) {
            categories.set(skill.category, {
                category: skill.category,
                required: 0,
                possessed: 0,
                gap: 0,
            });
        }
        const cat = categories.get(skill.category)!;
        cat.required += 1;
        cat.possessed += 1;
    });

    // Process partial skills (count as 0.5)
    partial.forEach(skill => {
        if (!categories.has(skill.category)) {
            categories.set(skill.category, {
                category: skill.category,
                required: 0,
                possessed: 0,
                gap: 0,
            });
        }
        const cat = categories.get(skill.category)!;
        cat.required += 1;
        cat.possessed += 0.5;
    });

    // Process missing skills
    missing.forEach(skill => {
        if (!categories.has(skill.category)) {
            categories.set(skill.category, {
                category: skill.category,
                required: 0,
                possessed: 0,
                gap: 0,
            });
        }
        const cat = categories.get(skill.category)!;
        cat.required += 1;
        cat.gap += 1;
    });

    return Array.from(categories.values()).sort((a, b) => {
        // Sort by percentage (highest first)
        const aPercent = a.required > 0 ? a.possessed / a.required : 0;
        const bPercent = b.required > 0 ? b.possessed / b.required : 0;
        return bPercent - aPercent;
    });
}
