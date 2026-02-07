'use client';

import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import type { FormattingAnalysis, ResumeStructure } from '@/lib/ats-engine';

interface FormattingPanelProps {
    formatting: FormattingAnalysis;
    structure: ResumeStructure;
}

export default function FormattingPanel({ formatting, structure }: FormattingPanelProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-700';
        if (score >= 60) return 'text-amber-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-700';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    // Essential sections that every resume should have
    const essentialChecks = [
        {
            label: 'Contact Information',
            passed: structure.hasContact,
            description: 'Name and contact details at the top',
            priority: 'critical'
        },
        {
            label: 'Email Address',
            passed: structure.hasEmail,
            description: 'Professional email for communication',
            priority: 'critical'
        },
        {
            label: 'Phone Number',
            passed: structure.hasPhone,
            description: 'Direct phone contact',
            priority: 'critical'
        },
        {
            label: 'Work Experience',
            passed: structure.hasExperience,
            description: 'Professional experience section',
            priority: 'critical'
        },
        {
            label: 'Education',
            passed: structure.hasEducation,
            description: 'Educational background',
            priority: 'critical'
        },
    ];

    // Recommended sections that improve ATS performance
    const recommendedChecks = [
        {
            label: 'Professional Summary',
            passed: structure.hasSummary,
            description: 'Brief overview of qualifications',
            priority: 'high'
        },
        {
            label: 'Skills Section',
            passed: structure.hasSkillsSection,
            description: 'Dedicated skills list for keyword matching',
            priority: 'high'
        },
        {
            label: 'LinkedIn Profile',
            passed: structure.hasLinkedIn,
            description: 'Professional networking presence',
            priority: 'medium'
        },
    ];

    // Format quality checks
    const formatChecks = [
        {
            label: 'Section Structure',
            passed: formatting.hasProperSections,
            description: 'Clear section headings and organization',
            priority: 'high'
        },
        {
            label: 'Clean Formatting',
            passed: formatting.hasCleanFormat,
            description: 'Consistent styling, no special characters',
            priority: 'high'
        },
        {
            label: 'Appropriate Length',
            passed: formatting.hasProperLength,
            description: 'Resume length suitable for experience level',
            priority: 'medium'
        },
    ];

    const essentialPassed = essentialChecks.filter(c => c.passed).length;
    const recommendedPassed = recommendedChecks.filter(c => c.passed).length;
    const formatPassed = formatChecks.filter(c => c.passed).length;
    const totalPassed = essentialPassed + recommendedPassed + formatPassed;
    const totalChecks = essentialChecks.length + recommendedChecks.length + formatChecks.length;

    const renderCheckItem = (check: { label: string; passed: boolean; description: string; priority: string }, index: number) => (
        <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${check.passed ? 'bg-white' : 'bg-slate-50'}`}>
            <div className="flex-shrink-0 mt-0.5">
                {check.passed ? (
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                ) : (
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                        <FiXCircle className="w-3.5 h-3.5 text-red-600" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${check.passed ? 'text-slate-900' : 'text-slate-700'}`}>
                        {check.label}
                    </span>
                    {!check.passed && check.priority === 'critical' && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Required
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{check.description}</p>
            </div>
            <span className={`text-xs font-medium ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                {check.passed ? 'Found' : 'Missing'}
            </span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Resume Structure Analysis</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Comprehensive structure and formatting evaluation
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-bold ${getScoreColor(formatting.score)}`}>
                                {formatting.score}
                            </span>
                            <span className="text-sm text-slate-500">/100</span>
                        </div>
                        <p className="text-sm text-slate-500">{getScoreLabel(formatting.score)}</p>
                    </div>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Structure Completeness</span>
                    <span className="text-sm font-semibold text-slate-900">{totalPassed}/{totalChecks} checks passed</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${totalPassed / totalChecks >= 0.8 ? 'bg-green-500' :
                                totalPassed / totalChecks >= 0.6 ? 'bg-amber-500' :
                                    'bg-red-500'
                            }`}
                        style={{ width: `${(totalPassed / totalChecks) * 100}%` }}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{essentialPassed}/{essentialChecks.length}</p>
                        <p className="text-xs text-slate-500">Essential</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{recommendedPassed}/{recommendedChecks.length}</p>
                        <p className="text-xs text-slate-500">Recommended</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{formatPassed}/{formatChecks.length}</p>
                        <p className="text-xs text-slate-500">Formatting</p>
                    </div>
                </div>
            </div>

            {/* Essential Sections */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 flex items-center gap-2">
                            Essential Sections
                            <span className="text-xs font-normal text-slate-500">Must have</span>
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${essentialPassed === essentialChecks.length ? 'bg-green-100 text-green-700' :
                                essentialPassed >= essentialChecks.length - 1 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {essentialPassed}/{essentialChecks.length}
                        </span>
                    </div>
                </div>
                <div className="p-2 space-y-1">
                    {essentialChecks.map((check, i) => renderCheckItem(check, i))}
                </div>
            </div>

            {/* Recommended Sections */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 flex items-center gap-2">
                            Recommended Sections
                            <span className="text-xs font-normal text-slate-500">Improve ATS score</span>
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${recommendedPassed === recommendedChecks.length ? 'bg-green-100 text-green-700' :
                                recommendedPassed >= recommendedChecks.length - 1 ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-600'
                            }`}>
                            {recommendedPassed}/{recommendedChecks.length}
                        </span>
                    </div>
                </div>
                <div className="p-2 space-y-1">
                    {recommendedChecks.map((check, i) => renderCheckItem(check, i))}
                </div>
            </div>

            {/* Format Quality */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 flex items-center gap-2">
                            Format Quality
                            <span className="text-xs font-normal text-slate-500">ATS compatibility</span>
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${formatPassed === formatChecks.length ? 'bg-green-100 text-green-700' :
                                formatPassed >= formatChecks.length - 1 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {formatPassed}/{formatChecks.length}
                        </span>
                    </div>
                </div>
                <div className="p-2 space-y-1">
                    {formatChecks.map((check, i) => renderCheckItem(check, i))}
                </div>
            </div>

            {/* Summary Quality Assessment */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-medium text-slate-900">Summary Quality</h3>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Professional Summary</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {structure.summaryQuality === 'good' ? 'Well-written summary with relevant keywords' :
                                    structure.summaryQuality === 'weak' ? 'Summary exists but could be strengthened' :
                                        'No professional summary detected'}
                            </p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-lg ${structure.summaryQuality === 'good' ? 'bg-green-50 text-green-700 border border-green-100' :
                                structure.summaryQuality === 'weak' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {structure.summaryQuality === 'good' ? 'Strong' :
                                structure.summaryQuality === 'weak' ? 'Needs Work' : 'Missing'}
                        </span>
                    </div>

                    {structure.experienceCount > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-sm font-medium text-slate-700">Experience Entries</p>
                                <p className="text-xs text-slate-500 mt-0.5">Number of job positions detected</p>
                            </div>
                            <span className="text-lg font-semibold text-slate-900">{structure.experienceCount}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Detected Sections */}
            {structure.detectedSections.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-medium text-slate-900">Detected Resume Sections</h3>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {structure.detectedSections.map((section, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg border border-slate-200">
                                    <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    {section}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Formatting Issues */}
            {formatting.issues.length > 0 && (
                <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                    <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                        <h3 className="font-medium text-amber-800 flex items-center gap-2">
                            <FiAlertTriangle className="w-4 h-4" />
                            Formatting Issues Detected
                        </h3>
                    </div>
                    <div className="divide-y divide-amber-100">
                        {formatting.issues.map((issue, i) => (
                            <div key={i} className="px-4 py-3 flex items-start gap-3">
                                <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-amber-700 text-xs font-bold">{i + 1}</span>
                                </span>
                                <div>
                                    <p className="text-sm text-slate-700">{issue}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips Section */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-slate-700">ATS Formatting Tips</p>
                        <ul className="mt-2 text-sm text-slate-600 space-y-1">
                            <li>• Use standard section headings (Experience, Education, Skills)</li>
                            <li>• Avoid tables, text boxes, and complex formatting</li>
                            <li>• Use standard fonts (Arial, Calibri, Times New Roman)</li>
                            <li>• Keep to 1-2 pages depending on experience level</li>
                            <li>• Use bullet points for job responsibilities</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
