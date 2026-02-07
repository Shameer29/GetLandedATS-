'use client';

import { useState } from 'react';
import { FiTarget, FiZap, FiCheckCircle, FiAlertTriangle, FiBarChart2, FiDownload } from 'react-icons/fi';

import SkillsTable from './SkillsTable';
import AIOptimizer from './AIOptimizer';
import ComprehensiveAnalysisView from './ComprehensiveAnalysisView';

interface EnhancedAnalysisResultsProps {
    result: any; // API response structure varies
    resumeText: string;
    jobDescription: string;
}

export default function EnhancedAnalysisResults({ result, resumeText, jobDescription }: EnhancedAnalysisResultsProps) {
    const [activeSection, setActiveSection] = useState<string>('deep');

    // Extract data from result - handle both API field names
    const universalATS = result.universalATSResult || result.universalATS;
    const matchResult = result.matchResult || universalATS?.matchResult;
    const hasUniversalData = !!universalATS;
    const comprehensiveAnalysis = result.comprehensiveAnalysis;


    // Calculate overall match percentage
    const matchedCount = matchResult?.skills?.matched?.length || 0;
    const missingCount = matchResult?.skills?.missing?.length || 0;
    const totalSkills = matchedCount + missingCount;
    const matchPercentage = totalSkills > 0 ? Math.round((matchedCount / totalSkills) * 100) : 0;

    // Grade calculation
    const getGrade = (score: number) => {
        if (score >= 85) return { grade: 'A', color: 'from-emerald-500 to-green-600', label: 'Excellent Match!' };
        if (score >= 70) return { grade: 'B', color: 'from-blue-500 to-cyan-600', label: 'Good Match' };
        if (score >= 55) return { grade: 'C', color: 'from-amber-500 to-orange-500', label: 'Needs Improvement' };
        if (score >= 40) return { grade: 'D', color: 'from-orange-500 to-red-500', label: 'Low Match' };
        return { grade: 'F', color: 'from-red-500 to-rose-600', label: 'Poor Match' };
    };

    const gradeInfo = getGrade(matchPercentage);

    // Transform skills for components
    const matchedSkills = matchResult?.skills?.matched?.map((s: any) => ({
        skill: s.skill,
        importance: s.importance as 'required' | 'preferred' | 'bonus',
        foundInResume: true,
        jdFrequency: s.jdFrequency || 1,
        resumeFrequency: s.resumeFrequency || 1,
        proof: s.proof
    })) || [];

    const missingSkills = matchResult?.skills?.missing?.map((s: any) => ({
        skill: s.skill,
        importance: s.importance as 'required' | 'preferred' | 'bonus',
        foundInResume: false,
        jdFrequency: s.jdFrequency || 1,
        resumeFrequency: 0
    })) || [];

    // Get suggestions
    const suggestions = universalATS?.optimizeSuggestions || [];
    const cvEnhancement = universalATS?.cvEnhancement;

    // Helper to map JD skills to analysis format
    const mapSkillsToAnalysis = (jdSkills: any[], matchedSkillsList: any[]) => {
        if (!jdSkills) return [];
        return jdSkills.map(skill => {
            const isMatched = matchedSkillsList?.some((m: any) =>
                m.skill.toLowerCase() === skill.name.toLowerCase() ||
                m.matchedAs?.toLowerCase() === skill.name.toLowerCase()
            );

            // Find the match object to get frequency details if available
            const matchDetails = matchedSkillsList?.find((m: any) =>
                m.skill.toLowerCase() === skill.name.toLowerCase()
            );

            return {
                skill: skill.name,
                importance: skill.importance,
                foundInResume: !!isMatched,
                jdFrequency: skill.frequency || 1,
                resumeFrequency: matchDetails?.resumeFrequency || (isMatched ? 1 : 0),
                proof: matchDetails?.proof
            };
        });
    };

    const hardSkillsAnalysis = mapSkillsToAnalysis(universalATS?.jdAnalysis?.hardSkills || [], matchResult?.skills?.matched || []);
    const softSkillsAnalysis = mapSkillsToAnalysis(universalATS?.jdAnalysis?.softSkills || [], matchResult?.skills?.matched || []);

    // Sections for navigation
    const sections = [
        { id: 'deep', label: 'Deep Analysis', icon: FiBarChart2, description: 'Comprehensive resume check' },
        { id: 'skills', label: 'Skills Match', icon: FiCheckCircle, description: 'Detailed skill analysis' },
        { id: 'optimize', label: 'AI Optimizer', icon: FiZap, description: 'AI-powered improvements' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Hero Score Section */}
            <div className={`bg-gradient-to-r ${gradeInfo.color} py-8`}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <h1 className="text-3xl font-black">ATS Analysis Complete</h1>
                            <p className="text-white/80 mt-1">{gradeInfo.label}</p>
                        </div>

                        <div className="flex items-center gap-8">
                            {/* Main Score */}
                            <div className="text-center">
                                <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                                    <div>
                                        <p className="text-4xl font-black text-white">{matchPercentage}%</p>
                                        <p className="text-xs text-white/80 font-medium">MATCH</p>
                                    </div>
                                </div>
                            </div>

                            {/* Grade Badge */}
                            <div className="bg-white rounded-2xl px-6 py-4 text-center shadow-lg">
                                <p className="text-sm text-slate-500 font-medium">Grade</p>
                                <p className="text-5xl font-black text-slate-900">{gradeInfo.grade}</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3 text-white">
                                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center">
                                    <p className="text-2xl font-black">{matchedCount}</p>
                                    <p className="text-xs text-white/80">Matched</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center">
                                    <p className="text-2xl font-black">{missingCount}</p>
                                    <p className="text-xs text-white/80">Missing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Navigation */}
            <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeSection === section.id
                                    ? 'border-violet-600 text-violet-700 bg-violet-50'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <section.icon className="w-4 h-4" />
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Deep Analysis (Now Default) */}
                {activeSection === 'deep' && comprehensiveAnalysis && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Deep Resume Analysis</h2>
                            <p className="text-slate-600">Comprehensive check across all ATS factors</p>
                        </div>
                        <ComprehensiveAnalysisView
                            analysis={comprehensiveAnalysis}
                            resumeText={resumeText}
                            jobDescription={jobDescription}
                            hardSkills={hardSkillsAnalysis}
                            softSkills={softSkillsAnalysis}
                        />
                    </div>
                )}

                {/* Skills Match Table */}
                {activeSection === 'skills' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Skills Match Analysis</h2>
                            <p className="text-slate-600">Every skill the employer wants vs what you have</p>
                        </div>
                        <SkillsTable
                            matchedSkills={matchedSkills}
                            missingSkills={missingSkills}
                        />
                    </div>
                )}

                {/* AI Optimizer */}
                {activeSection === 'optimize' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">AI-Powered Optimizations</h2>
                            <p className="text-slate-600">Copy-paste ready improvements for your resume</p>
                        </div>
                        <AIOptimizer
                            suggestions={suggestions}
                            cvEnhancement={cvEnhancement}
                        />
                    </div>
                )}



                {activeSection === 'deep' && !comprehensiveAnalysis && (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                        <FiBarChart2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-slate-500">Deep analysis data unavailable</p>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 shadow-lg">
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        <span className="font-medium text-violet-700">{matchPercentage}% match</span> —
                        {matchPercentage >= 70
                            ? ' Great job! Your resume is well-optimized.'
                            : ` Add ${missingSkills.filter((s: any) => s.importance === 'required').length} required skills to boost your score.`
                        }
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveSection('optimize')}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
                        >
                            <FiZap className="w-4 h-4" />
                            Optimize Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
