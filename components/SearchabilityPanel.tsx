'use client';

import { FiSearch, FiCheckCircle, FiXCircle, FiAlertTriangle, FiMail, FiPhone, FiLinkedin, FiUser, FiLayout, FiBriefcase, FiCalendar, FiFileText } from 'react-icons/fi';
import type { SearchabilityAnalysis } from '@/lib/ats-engine';

interface SearchabilityPanelProps {
    searchability: SearchabilityAnalysis;
}

export default function SearchabilityPanel({ searchability }: SearchabilityPanelProps) {
    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 70) return 'bg-green-100';
        if (score >= 50) return 'bg-amber-100';
        return 'bg-red-100';
    };

    const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
        switch (status) {
            case 'pass':
                return <FiCheckCircle className="w-5 h-5 text-green-600" />;
            case 'fail':
                return <FiXCircle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <FiAlertTriangle className="w-5 h-5 text-amber-600" />;
        }
    };

    const getStatusBg = (status: 'pass' | 'fail' | 'warning') => {
        switch (status) {
            case 'pass':
                return 'bg-green-50 border-green-200';
            case 'fail':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-amber-50 border-amber-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'contact':
                return <FiUser className="w-4 h-4" />;
            case 'headings':
                return <FiLayout className="w-4 h-4" />;
            case 'jobtitle':
                return <FiBriefcase className="w-4 h-4" />;
            case 'dates':
                return <FiCalendar className="w-4 h-4" />;
            case 'formatting':
                return <FiFileText className="w-4 h-4" />;
            default:
                return <FiSearch className="w-4 h-4" />;
        }
    };

    // Count passes/fails/warnings
    const passCount = searchability.checks?.filter(c => c.status === 'pass').length || 0;
    const failCount = searchability.checks?.filter(c => c.status === 'fail').length || 0;
    const warningCount = searchability.checks?.filter(c => c.status === 'warning').length || 0;
    const totalChecks = searchability.checks?.length || 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">ATS Searchability</h3>
                        <p className="text-sm text-slate-500">Can the ATS read and parse your resume?</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl ${getScoreBg(searchability.score)}`}>
                        <p className={`text-3xl font-black ${getScoreColor(searchability.score)}`}>
                            {searchability.score}%
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-sm">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">{passCount} Passed</span>
                    </div>
                    {failCount > 0 && (
                        <div className="flex items-center gap-1.5 text-sm">
                            <FiXCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-700 font-medium">{failCount} Failed</span>
                        </div>
                    )}
                    {warningCount > 0 && (
                        <div className="flex items-center gap-1.5 text-sm">
                            <FiAlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-700 font-medium">{warningCount} Warnings</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Contact Info Parsing */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        Contact Information
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className={`p-3 rounded-xl text-center border ${searchability.contactParsing?.hasEmail === true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {searchability.contactParsing?.hasEmail === true ? (
                                <FiCheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            ) : (
                                <FiXCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                            )}
                            <FiMail className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                            <p className="text-xs font-medium">Email</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center border ${searchability.contactParsing?.hasPhone === true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {searchability.contactParsing?.hasPhone === true ? (
                                <FiCheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            ) : (
                                <FiXCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                            )}
                            <FiPhone className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                            <p className="text-xs font-medium">Phone</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center border ${searchability.contactParsing?.hasLinkedIn === true ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            {searchability.contactParsing?.hasLinkedIn === true ? (
                                <FiCheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            ) : (
                                <FiAlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                            )}
                            <FiLinkedin className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                            <p className="text-xs font-medium">LinkedIn</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center border ${searchability.contactParsing?.hasName === true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {searchability.contactParsing?.hasName === true ? (
                                <FiCheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            ) : (
                                <FiXCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                            )}
                            <FiUser className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                            <p className="text-xs font-medium">Name</p>
                        </div>
                    </div>
                    {searchability.contactParsing && !searchability.contactParsing.inParseableLocation && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800">⚠️ Contact info may be in header/footer - some ATS can't read this</p>
                        </div>
                    )}
                </div>

                {/* Job Title Match */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FiBriefcase className="w-4 h-4" />
                        Job Title Match
                    </h4>
                    <div className={`p-4 rounded-xl border ${searchability.jobTitleMatch?.foundInResume === true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-3">
                            {searchability.jobTitleMatch?.foundInResume === true ? (
                                <FiCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            ) : (
                                <FiXCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-medium text-slate-900">
                                    Target: <span className="text-blue-600">{searchability.jobTitleMatch?.jdTitle || 'Not detected'}</span>
                                </p>
                                {searchability.jobTitleMatch?.foundInResume === true ? (
                                    <p className="text-sm text-green-700 mt-1">
                                        {searchability.jobTitleMatch.exactMatch ? '✓ Exact match found in resume' : '✓ Similar title found in resume'}
                                    </p>
                                ) : (
                                    <p className="text-sm text-red-700 mt-1">
                                        ✗ Job title not found - add it to your resume header or summary
                                    </p>
                                )}
                                {searchability.jobTitleMatch?.variations && searchability.jobTitleMatch.variations.length > 0 && (
                                    <p className="text-xs text-slate-600 mt-1">
                                        Found: {searchability.jobTitleMatch.variations.join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Headings */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FiLayout className="w-4 h-4" />
                        Section Headings
                    </h4>
                    <div className={`p-4 rounded-xl border ${searchability.sectionHeadings?.usesStandardHeadings ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                        {searchability.sectionHeadings?.usesStandardHeadings ? (
                            <div className="flex items-center gap-2 mb-2">
                                <FiCheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-green-700 font-medium">Uses ATS-friendly headings</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-2">
                                <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                                <span className="text-amber-700 font-medium">Some non-standard headings detected</span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {searchability.sectionHeadings?.detectedHeadings?.map((heading, i) => (
                                <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium">
                                    {heading}
                                </span>
                            ))}
                        </div>
                        {searchability.sectionHeadings?.nonStandardHeadings && searchability.sectionHeadings.nonStandardHeadings.length > 0 && (
                            <div className="mt-2 text-xs text-amber-700">
                                ⚠️ Non-standard: {searchability.sectionHeadings.nonStandardHeadings.join(', ')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Format & Formatting Risks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date Format */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <FiCalendar className="w-4 h-4" />
                            Date Format
                        </h4>
                        <div className={`p-3 rounded-xl border ${searchability.dateFormat?.isATSFriendly ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            {searchability.dateFormat?.isATSFriendly ? (
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700">ATS-friendly dates</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm text-amber-700">Check date format</span>
                                </div>
                            )}
                            {searchability.dateFormat?.issues && searchability.dateFormat.issues.length > 0 && (
                                <ul className="mt-2 text-xs text-slate-600 space-y-1">
                                    {searchability.dateFormat.issues.map((issue, i) => (
                                        <li key={i}>• {issue}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Formatting Risks */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <FiFileText className="w-4 h-4" />
                            Formatting Risks
                        </h4>
                        <div className="space-y-2">
                            {/* Tables */}
                            <div className={`p-3 rounded-xl border ${!searchability.formattingRisks?.hasTables ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-2">
                                    {!searchability.formattingRisks?.hasTables ? (
                                        <>
                                            <FiCheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-green-700">No tables detected</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiXCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-xs text-red-700">Tables detected</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Columns */}
                            <div className={`p-3 rounded-xl border ${!searchability.formattingRisks?.hasColumns ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-2">
                                    {!searchability.formattingRisks?.hasColumns ? (
                                        <>
                                            <FiCheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-green-700">No multi-column layout</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiXCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-xs text-red-700">Multi-column layout detected</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Images */}
                            <div className={`p-3 rounded-xl border ${!searchability.formattingRisks?.hasImages ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-2">
                                    {!searchability.formattingRisks?.hasImages ? (
                                        <>
                                            <FiCheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-green-700">No images/graphics detected</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiXCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-xs text-red-700">Images/graphics detected</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Quality & Safety */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FiFileText className="w-4 h-4" />
                        Content Quality & Safety
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Empty Sections Check */}
                        <div className={`p-3 rounded-xl border ${!searchability.contentChecks?.hasEmptySections ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {!searchability.contentChecks?.hasEmptySections ? (
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700">All sections have content</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <FiXCircle className="w-5 h-5 text-red-600" />
                                        <span className="text-sm font-medium text-red-700">Empty sections found</span>
                                    </div>
                                    <p className="text-xs text-red-600">
                                        Add content to: {searchability.contentChecks?.emptySectionsList?.join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Education Match */}
                        <div className={`p-3 rounded-xl border ${searchability.contentChecks?.educationMatch?.match === true ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            {searchability.contentChecks?.educationMatch?.match === true ? (
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700">Education matches JD</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                                        <span className="text-sm font-medium text-amber-700">Education mismatch</span>
                                    </div>
                                    <p className="text-xs text-amber-600">
                                        JD asks for {searchability.contentChecks?.educationMatch?.requiredLevel}, found {searchability.contentChecks?.educationMatch?.foundLevel}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Location Check */}
                        <div className={`p-3 rounded-xl border ${searchability.contentChecks?.locationPresent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {searchability.contentChecks?.locationPresent ? (
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700">Location provided</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FiXCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-sm text-red-700">Location missing</span>
                                </div>
                            )}
                        </div>

                        {/* Summary Check (Moved here per JobScan parity) */}
                        <div className={`p-3 rounded-xl border ${searchability.contentChecks?.hasSummary === true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {searchability.contentChecks?.hasSummary === true ? (
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700">Summary found</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FiXCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-sm text-red-700">Summary missing</span>
                                </div>
                            )}
                        </div>

                        {/* Filename Check */}
                        <div className={`p-3 rounded-xl border ${searchability.contentChecks?.filenameSafe === true ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            {searchability.contentChecks?.filenameSafe === true ? (
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700">Filename is safe</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm text-amber-700">Rename file (no special chars)</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Full Checklist */}
                {searchability.checks && searchability.checks.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3">All Checks</h4>
                        <div className="space-y-2">
                            {searchability.checks.map((check, i) => (
                                <div key={i} className={`p-3 rounded-xl border ${getStatusBg(check.status)}`}>
                                    <div className="flex items-start gap-3">
                                        {getStatusIcon(check.status)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                {getCategoryIcon(check.category)}
                                                <span className="text-xs font-medium text-slate-500 uppercase">{check.category}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900">{check.item}</p>
                                            <p className="text-xs text-slate-600 mt-0.5">{check.detail}</p>
                                            {check.fix && check.status !== 'pass' && (
                                                <p className="text-xs text-blue-700 mt-1 font-medium">💡 {check.fix}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
