'use client';

import { useState } from 'react';
import {
    PiTarget, PiCheckCircle, PiHeart, PiMagnifyingGlass, PiUser, PiFileText,
    PiColumns, PiPencilCircle, PiArrowsClockwise, PiGraph, PiTrendUp, PiWarningCircle,
    PiCpu, PiList, PiX
} from 'react-icons/pi';
import type { ATSAnalysisResult } from '@/lib/ats-engine';

import MatchRateBar from './MatchRateBar';
import HardSkillsPanel from './HardSkillsPanel';
import SoftSkillsPanel from './SoftSkillsPanel';
import SearchabilityPanel from './SearchabilityPanel';
import RecruiterTipsPanel from './RecruiterTipsPanel';
import FormattingPanel from './FormattingPanel';
import AIRewritesPanel from './AIRewritesPanel';
import ScoreGauge from './ScoreGauge'; // Re-using existing component

interface ResultsDashboardProps {
    result: ATSAnalysisResult;
    resumeText: string;
    jobDescription: string;
    onReset: () => void;
}

export default function ResultsDashboard({ result, resumeText, jobDescription, onReset }: ResultsDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: PiTarget },
        { id: 'hard-skills', label: 'Hard Skills', icon: PiCheckCircle, count: result.hardSkills.filter(s => !s.matched).length },
        { id: 'soft-skills', label: 'Soft Skills', icon: PiHeart, count: result.softSkills.filter(s => !s.matched).length },
        { id: 'searchability', label: 'Searchability', icon: PiMagnifyingGlass, warning: result.searchability.score < 70 },
        { id: 'recruiter', label: 'Recruiter Tips', icon: PiUser },
        { id: 'formatting', label: 'Structure', icon: PiFileText },
        { id: 'ai-rewrites', label: 'AI Suggestions', icon: PiPencilCircle },
    ];

    const getScoreStatus = (score: number) => {
        if (score >= 70) return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
        if (score >= 50) return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
        return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
    };

    return (
        <div className="flex size-full h-screen bg-slate-50 relative overflow-hidden">

            {/* Mobile Header */}
            <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <PiGraph className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">GetLanded ATS</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    {isMobileMenuOpen ? <PiX className="w-6 h-6" /> : <PiList className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Navigation - Responsive */}
            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`
                fixed lg:static inset-y-0 left-0 
                w-72 bg-white border-r border-slate-200 
                flex flex-col z-50 shadow-2xl lg:shadow-xl shadow-slate-200/50
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 hidden lg:block">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <PiGraph className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight">GetLanded ATS</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <ScoreGauge score={result.matchRate.overall} size="sm" showLabel={false} />
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Match Score</p>
                            <p className={`text-2xl font-bold ${getScoreStatus(result.matchRate.overall).color}`}>
                                {result.matchRate.overall}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar Header Variation */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 lg:hidden">
                    <div className="flex items-center gap-4">
                        <ScoreGauge score={result.matchRate.overall} size="sm" showLabel={false} />
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Match Score</p>
                            <p className={`text-2xl font-bold ${getScoreStatus(result.matchRate.overall).color}`}>
                                {result.matchRate.overall}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {tabs.map(tab => {
                        const TabIcon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setIsMobileMenuOpen(false); // Close menu on selection
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <TabIcon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span>{tab.label}</span>
                                </div>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                                {tab.warning && (
                                    <PiWarningCircle className="w-4 h-4 text-amber-500" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-colors shadow-sm"
                    >
                        <PiArrowsClockwise className="w-4 h-4" />
                        Start New Analysis
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-3">
                        Professional Edition v2.0
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative h-full pt-16 lg:pt-0 w-full">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
                    {/* Header for Active Section */}
                    <div className="mb-8 mt-2">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-slate-500">
                            {activeTab === 'overview' ? "Here's how your resume stacks up against the job description." :
                                activeTab === 'hard-skills' ? 'Detailed breakdown of technical qualifications.' :
                                    activeTab === 'searchability' ? 'How easily your profile can be found by recruiters.' :
                                        'Optimization details and improvements.'}
                        </p>
                    </div>

                    {/* Content Rendering */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <MatchRateBar matchRate={result.matchRate} />
                                </div>

                                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {/* Quick Insight Cards */}
                                    <button onClick={() => setActiveTab('hard-skills')} className="group text-left p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <PiCheckCircle className="w-6 h-6" />
                                            </div>
                                            <span className={`text-xl font-bold ${getScoreStatus(result.matchRate.hardSkills).color}`}>
                                                {result.matchRate.hardSkills}%
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900">Hard Skills</h3>
                                        <p className="text-sm text-slate-500 mt-1">{result.hardSkills.filter(s => s.matched).length} matched keywords</p>
                                    </button>

                                    <button onClick={() => setActiveTab('soft-skills')} className="group text-left p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <PiHeart className="w-6 h-6" />
                                            </div>
                                            <span className={`text-xl font-bold ${getScoreStatus(result.matchRate.softSkills).color}`}>
                                                {result.matchRate.softSkills}%
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900">Soft Skills</h3>
                                        <p className="text-sm text-slate-500 mt-1">{result.softSkills.filter(s => s.matched).length} matched traits</p>
                                    </button>

                                    <button onClick={() => setActiveTab('ai-rewrites')} className="group text-left p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <PiPencilCircle className="w-6 h-6" />
                                            </div>
                                            <span className="text-xl font-bold text-slate-900">
                                                {result.aiRewrites.bullets.length}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900">AI Rewrites</h3>
                                        <p className="text-sm text-slate-500 mt-1">Optimization suggestions</p>
                                    </button>
                                </div>

                                {/* Main Action Card */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                                            <PiCpu className="w-6 h-6 text-blue-200" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold mb-2">Recommended Next Step</h3>
                                            {result.matchRate.overall < 70 ? (
                                                <>
                                                    <p className="text-slate-300 mb-6 max-w-xl">
                                                        Your resume needs optimization to pass ATS filters. Focus on adding the missing hard skills listed in the analysis to boost your score immediately.
                                                    </p>
                                                    <button
                                                        onClick={() => setActiveTab('hard-skills')}
                                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/50 w-full sm:w-auto text-center"
                                                    >
                                                        Review Missing Skills
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-slate-300 mb-6 max-w-xl">
                                                        Your resume is strong! Review the AI suggestions to refine your bullet points for maximum impact.
                                                    </p>
                                                    <button
                                                        onClick={() => setActiveTab('ai-rewrites')}
                                                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-purple-900/50 w-full sm:w-auto text-center"
                                                    >
                                                        See Suggestions
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'hard-skills' && <HardSkillsPanel skills={result.hardSkills} resumeText={resumeText} jobDescription={jobDescription} />}
                        {activeTab === 'soft-skills' && <SoftSkillsPanel skills={result.softSkills} resumeText={resumeText} jobDescription={jobDescription} />}
                        {activeTab === 'searchability' && <SearchabilityPanel searchability={result.searchability} />}
                        {activeTab === 'recruiter' && <RecruiterTipsPanel tips={result.recruiterTips} />}
                        {activeTab === 'formatting' && <FormattingPanel formatting={result.formatting} structure={result.resumeStructure} />}
                        {activeTab === 'ai-rewrites' && <AIRewritesPanel rewrites={result.aiRewrites} />}
                    </div>
                </div>
            </main>
        </div>
    );
}
