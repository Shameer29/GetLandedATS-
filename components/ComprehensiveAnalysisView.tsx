'use client';

import { useState } from 'react';
import {
    FiUser, FiMail, FiPhone, FiLinkedin, FiMapPin, FiGlobe,
    FiFileText, FiList, FiBarChart2, FiTrendingUp, FiSearch,
    FiAward, FiAlertTriangle, FiCheckCircle, FiXCircle, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import type { ComprehensiveAnalysis } from '@/lib/comprehensive-analyzer';

import SideBySideComparison from './SideBySideComparison';

interface ComprehensiveAnalysisViewProps {
    analysis: ComprehensiveAnalysis;
    resumeText: string;      // Pass raw text for comparison
    jobDescription: string;  // Pass raw text for comparison
    hardSkills: any[];       // Separated Hard Skills
    softSkills: any[];       // Separated Soft Skills
}

export default function ComprehensiveAnalysisView({ analysis, resumeText, jobDescription, hardSkills, softSkills }: ComprehensiveAnalysisViewProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('overview');
    const [activeComparison, setActiveComparison] = useState<'hard' | 'soft' | null>(null);

    const { overallReadiness } = analysis;

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'from-emerald-500 to-green-600';
            case 'B': return 'from-blue-500 to-cyan-600';
            case 'C': return 'from-amber-500 to-orange-500';
            case 'D': return 'from-orange-500 to-red-500';
            default: return 'from-red-500 to-rose-600';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    // Calculate scores dynamically
    const hardScore = hardSkills.length > 0
        ? Math.round((hardSkills.filter(s => s.foundInResume).length / hardSkills.length) * 100)
        : 0;

    const softScore = softSkills.length > 0
        ? Math.round((softSkills.filter(s => s.foundInResume).length / softSkills.length) * 100)
        : 0;

    const sections = [
        { id: 'overview', label: 'Overview', icon: FiAward },
        { id: 'hardSkills', label: 'Hard Skills', icon: FiCheckCircle, score: hardScore },
        { id: 'softSkills', label: 'Soft Skills', icon: FiTrendingUp, score: softScore },
        { id: 'structure', label: 'Resume Structure', icon: FiFileText, score: analysis.resumeStructure.structureScore },
        { id: 'contact', label: 'Contact Info', icon: FiUser, score: analysis.contactInfo.contactScore },
        { id: 'formatting', label: 'Formatting', icon: FiList, score: analysis.formatting.formattingScore },
        { id: 'content', label: 'Content Quality', icon: FiBarChart2, score: analysis.contentQuality.contentScore },
        { id: 'searchability', label: 'Searchability', icon: FiSearch, score: analysis.searchability.searchabilityScore },
        { id: 'career', label: 'Career Analysis', icon: FiTrendingUp, score: analysis.careerAnalysis.careerScore },
        { id: 'summary', label: 'Summary Check', icon: FiFileText, score: analysis.summaryAnalysis.summaryScore },
    ];

    return (
        <div className="space-y-6">
            {/* Overall Grade Card */}
            <div className={`bg-gradient-to-br ${getGradeColor(overallReadiness.grade)} rounded-2xl p-6 text-white shadow-xl`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Resume Readiness</p>
                        <div className="flex items-baseline gap-3 mt-1">
                            <span className="text-5xl font-black">{overallReadiness.score}%</span>
                            <span className="text-3xl font-bold opacity-80">Grade {overallReadiness.grade}</span>
                        </div>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <span className="text-4xl font-black">{overallReadiness.grade}</span>
                    </div>
                </div>

                {/* Strengths & Critical Issues */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70">Strengths</p>
                        <ul className="mt-2 space-y-1">
                            {overallReadiness.strengths.slice(0, 3).map((s, i) => (
                                <li key={i} className="text-sm flex items-center gap-2">
                                    <FiCheckCircle className="w-4 h-4 text-green-300" />
                                    {s}
                                </li>
                            ))}
                            {overallReadiness.strengths.length === 0 && (
                                <li className="text-sm text-white/60">No major strengths detected</li>
                            )}
                        </ul>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70">Critical Issues</p>
                        <ul className="mt-2 space-y-1">
                            {overallReadiness.criticalIssues.slice(0, 3).map((s, i) => (
                                <li key={i} className="text-sm flex items-center gap-2">
                                    <FiAlertTriangle className="w-4 h-4 text-yellow-300" />
                                    {s}
                                </li>
                            ))}
                            {overallReadiness.criticalIssues.length === 0 && (
                                <li className="text-sm text-white/60">No critical issues found</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Score Cards Grid */}
            <div className="grid grid-cols-4 gap-3">
                {sections.filter(s => s.score !== undefined).map(section => (
                    <button
                        key={section.id}
                        onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                        className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${expandedSection === section.id
                            ? 'border-slate-900 bg-slate-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <section.icon className="w-5 h-5 text-slate-400" />
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(section.score!)}`}>
                                {section.score}%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 text-left">{section.label}</p>
                    </button>
                ))}
            </div>

            {/* Hard Skills Section */}
            {expandedSection === 'hardSkills' && (
                <ExpandedCard title="Hard Skills & Technical" score={hardScore}>
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                {activeComparison === 'hard' ? 'Technical Comparison' : 'Matched Skills'}
                            </h4>
                            <button
                                onClick={() => setActiveComparison(activeComparison === 'hard' ? null : 'hard')}
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm ${activeComparison === 'hard'
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {activeComparison === 'hard' ? (
                                    <> <FiXCircle className="w-3 h-3" /> Close Comparison </>
                                ) : (
                                    <> <FiSearch className="w-3 h-3" /> Compare Hard Skills </>
                                )}
                            </button>
                        </div>

                        {activeComparison === 'hard' ? (
                            <div className="border rounded-xl overflow-hidden shadow-inner bg-slate-50">
                                <SideBySideComparison
                                    resumeText={resumeText}
                                    jobDescription={jobDescription}
                                    matchedSkills={hardSkills.filter(s => s.foundInResume)}
                                    missingSkills={hardSkills.filter(s => !s.foundInResume)}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {hardSkills.filter(s => s.foundInResume).map((skill, i) => (
                                        <span key={i} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            <FiCheckCircle className="w-3 h-3" /> {skill.skill}
                                        </span>
                                    ))}
                                    {hardSkills.filter(s => s.foundInResume).length === 0 && (
                                        <p className="text-sm text-slate-400 italic">No hard skills matched yet.</p>
                                    )}
                                </div>

                                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Missing Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {hardSkills.filter(s => !s.foundInResume).map((skill, i) => (
                                        <span key={i} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-red-100">
                                            <FiXCircle className="w-3 h-3" /> {skill.skill}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </ExpandedCard>
            )}

            {/* Soft Skills Section */}
            {expandedSection === 'softSkills' && (
                <ExpandedCard title="Soft Skills & Culture" score={softScore}>
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                {activeComparison === 'soft' ? 'Behavioral Comparison' : 'Matched Traits'}
                            </h4>
                            <button
                                onClick={() => setActiveComparison(activeComparison === 'soft' ? null : 'soft')}
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm ${activeComparison === 'soft'
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                {activeComparison === 'soft' ? (
                                    <> <FiXCircle className="w-3 h-3" /> Close Comparison </>
                                ) : (
                                    <> <FiSearch className="w-3 h-3" /> Compare Soft Skills </>
                                )}
                            </button>
                        </div>

                        {activeComparison === 'soft' ? (
                            <div className="border rounded-xl overflow-hidden shadow-inner bg-slate-50">
                                <SideBySideComparison
                                    resumeText={resumeText}
                                    jobDescription={jobDescription}
                                    matchedSkills={softSkills.filter(s => s.foundInResume)}
                                    missingSkills={softSkills.filter(s => !s.foundInResume)}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {softSkills.filter(s => s.foundInResume).map((skill, i) => (
                                        <span key={i} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            <FiCheckCircle className="w-3 h-3" /> {skill.skill}
                                        </span>
                                    ))}
                                </div>

                                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Missing Traits</h4>
                                <div className="flex flex-wrap gap-2">
                                    {softSkills.filter(s => !s.foundInResume).map((skill, i) => (
                                        <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-amber-100">
                                            <FiAlertTriangle className="w-3 h-3" /> {skill.skill}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </ExpandedCard>
            )}

            {/* Expanded Details */}
            {expandedSection === 'structure' && (
                <ExpandedCard title="Resume Structure" score={analysis.resumeStructure.structureScore}>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Detected Sections</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.resumeStructure.detectedSections.map(s => (
                                    <span key={s.name} className={`px-3 py-1 rounded-full text-xs font-medium ${s.detected
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                        {s.detected ? '✓' : '✗'} {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {analysis.resumeStructure.missingSections.length > 0 && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm font-bold text-amber-800">Missing Required Sections:</p>
                                <p className="text-sm text-amber-700">{analysis.resumeStructure.missingSections.join(', ')}</p>
                            </div>
                        )}
                    </div>
                </ExpandedCard>
            )}

            {expandedSection === 'contact' && (
                <ExpandedCard title="Contact Information" score={analysis.contactInfo.contactScore}>
                    <div className="grid grid-cols-3 gap-3">
                        <ContactItem icon={FiMail} label="Email" present={analysis.contactInfo.hasEmail} />
                        <ContactItem icon={FiPhone} label="Phone" present={analysis.contactInfo.hasPhone} />
                        <ContactItem icon={FiLinkedin} label="LinkedIn" present={analysis.contactInfo.hasLinkedIn} />
                        <ContactItem icon={FiMapPin} label="Location" present={analysis.contactInfo.hasLocation} />
                        <ContactItem icon={FiGlobe} label="Portfolio" present={analysis.contactInfo.hasPortfolio} />
                        <ContactItem
                            icon={FiMail}
                            label="Professional Email"
                            present={analysis.contactInfo.hasProfessionalEmail}
                        />
                    </div>
                    <IssuesList issues={analysis.contactInfo.issues} />
                </ExpandedCard>
            )}

            {expandedSection === 'formatting' && (
                <ExpandedCard title="Formatting & Readability" score={analysis.formatting.formattingScore}>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <Stat label="Word Count" value={analysis.formatting.wordCount} />
                        <Stat label="Est. Pages" value={analysis.formatting.estimatedPages} />
                        <Stat label="Bullet Points" value={analysis.formatting.bulletPointCount} />
                        <Stat label="Avg Bullet Len" value={`${analysis.formatting.avgBulletLength} chars`} />
                    </div>
                    <div className="flex gap-3 mb-4">
                        <StatusBadge label="Length" status={analysis.formatting.isLengthOptimal} />
                        <StatusBadge label="Date Consistency" status={analysis.formatting.hasConsistentDates} />
                        <StatusBadge label="Clean Characters" status={!analysis.formatting.hasUnusualCharacters} />
                    </div>
                    <IssuesList issues={analysis.formatting.issues} />
                </ExpandedCard>
            )}

            {expandedSection === 'content' && (
                <ExpandedCard title="Content Quality" score={analysis.contentQuality.contentScore}>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <Stat label="Action Verbs" value={`${analysis.contentQuality.actionVerbPercentage}%`} target="70%+" />
                        <Stat label="With Metrics" value={`${analysis.contentQuality.metricsPercentage}%`} target="40%+" />
                        <Stat label="Weak Phrases" value={analysis.contentQuality.weakPhrasesCount} bad={analysis.contentQuality.weakPhrasesCount > 0} />
                        <Stat label="Total Bullets" value={analysis.contentQuality.totalBullets} />
                    </div>
                    <IssuesList issues={analysis.contentQuality.issues} />
                </ExpandedCard>
            )}

            {expandedSection === 'searchability' && (
                <ExpandedCard title="Keyword Searchability" score={analysis.searchability.searchabilityScore}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Stat label="Keyword Match Rate" value={`${analysis.searchability.keywordDensity}%`} target="60%+" />
                        <Stat label="Skills in Skills Section" value={analysis.searchability.skillsInSkillsSection} />
                    </div>
                    {analysis.searchability.topKeywordsFound.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Top Keywords</p>
                            <div className="space-y-2">
                                {analysis.searchability.topKeywordsFound.slice(0, 5).map((kw, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                                        <span className="font-medium">{kw.keyword}</span>
                                        <span className="text-slate-500">JD: {kw.jdCount} | You: {kw.resumeCount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <IssuesList issues={analysis.searchability.issues} />
                </ExpandedCard>
            )}

            {expandedSection === 'career' && (
                <ExpandedCard title="Career Analysis" score={analysis.careerAnalysis.careerScore}>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <Stat label="Title Alignment" value={`${analysis.careerAnalysis.titleAlignment}%`} />
                        <Stat label="Job Count" value={analysis.careerAnalysis.jobCount} />
                        <Stat label="Avg Tenure" value={`${analysis.careerAnalysis.avgTenure} mo`} />
                        <StatusBadge label="Career Growth" status={analysis.careerAnalysis.hasCareerProgression} />
                    </div>
                    {analysis.careerAnalysis.employmentGaps.length > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                            <p className="text-sm font-bold text-amber-800">Employment Gaps Detected</p>
                            {analysis.careerAnalysis.employmentGaps.map((gap, i) => (
                                <p key={i} className="text-sm text-amber-700">
                                    {gap.from} to {gap.to} ({gap.months} months)
                                </p>
                            ))}
                        </div>
                    )}
                    <IssuesList issues={analysis.careerAnalysis.issues} />
                </ExpandedCard>
            )}

            {expandedSection === 'summary' && (
                <ExpandedCard title="Professional Summary" score={analysis.summaryAnalysis.summaryScore}>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <StatusBadge label="Has Summary" status={analysis.summaryAnalysis.hasSummary} />
                        <Stat label="Word Count" value={analysis.summaryAnalysis.summaryLength} target="30-80" />
                        <StatusBadge label="Has Keywords" status={analysis.summaryAnalysis.containsKeywords} />
                        <StatusBadge label="Not Generic" status={!analysis.summaryAnalysis.isGeneric} />
                    </div>
                    {analysis.summaryAnalysis.keywordsInSummary.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Keywords in Summary</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.summaryAnalysis.keywordsInSummary.map((kw, i) => (
                                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <IssuesList issues={analysis.summaryAnalysis.issues} />
                </ExpandedCard>
            )}

            {/* All Improvements List */}
            {overallReadiness.improvements.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                        All Improvements ({overallReadiness.improvements.length})
                    </h3>
                    <ul className="space-y-2">
                        {overallReadiness.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <FiAlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                {imp}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Helper Components
function ExpandedCard({ title, score, children }: { title: string; score: number; children: React.ReactNode }) {
    return (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Score:</span>
                    <span className="text-xl font-bold text-slate-900">{score}%</span>
                </div>
            </div>
            {children}
        </div>
    );
}

function ContactItem({ icon: Icon, label, present }: { icon: React.ElementType; label: string; present: boolean }) {
    return (
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${present ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
            <Icon className={`w-4 h-4 ${present ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${present ? 'text-green-700' : 'text-red-700'}`}>{label}</span>
            {present ? <FiCheckCircle className="w-4 h-4 text-green-600 ml-auto" /> : <FiXCircle className="w-4 h-4 text-red-600 ml-auto" />}
        </div>
    );
}

function Stat({ label, value, target, bad }: { label: string; value: string | number; target?: string; bad?: boolean }) {
    return (
        <div className={`p-3 rounded-lg border ${bad ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className={`text-lg font-bold ${bad ? 'text-red-700' : 'text-slate-900'}`}>{value}</p>
            {target && <p className="text-xs text-slate-400">Target: {target}</p>}
        </div>
    );
}

function StatusBadge({ label, status }: { label: string; status: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
            {status ? <FiCheckCircle className="w-4 h-4 text-green-600" /> : <FiXCircle className="w-4 h-4 text-red-600" />}
            <span className={`text-sm font-medium ${status ? 'text-green-700' : 'text-red-700'}`}>{label}</span>
        </div>
    );
}

function IssuesList({ issues }: { issues: string[] }) {
    if (issues.length === 0) return null;
    return (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Issues to Fix</p>
            <ul className="space-y-1">
                {issues.map((issue, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                        <FiAlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {issue}
                    </li>
                ))}
            </ul>
        </div>
    );
}
