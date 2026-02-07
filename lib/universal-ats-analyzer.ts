import 'server-only';
import { analyzeJobDescription } from './jd-analyzer';
import { analyzeResume } from './resume-ai-analyzer';
import { matchJDToResumeAI } from './ai-matcher';
import { generateAIRecruiterTips } from './recruiter-tips-ai';
import { generateRecommendations, generateOptimizeSuggestions } from './recommendations';
import { enhanceCV } from './cv-enhancer';
import { runComprehensiveAnalysis } from './comprehensive-analyzer';
import type {
    UniversalATSResult,
    HighlightedText,
    ATSCompatibility,
    ATSCheck
} from '@/types/universal-ats';

/**
 * Universal ATS Analyzer
 * The main orchestrator that runs all analysis modules
 * AI-powered, no hardcoding, works for ALL jobs worldwide
 */
export async function runUniversalATSAnalysis(
    resumeText: string,
    jobDescriptionText: string,
    fileType: 'pdf' | 'docx' = 'pdf'
): Promise<UniversalATSResult> {
    console.log('🚀 Starting Universal ATS Analysis...');

    // Step 1: Analyze Job Description (AI extracts all requirements)
    console.log('📋 Analyzing Job Description...');
    const jdAnalysis = await analyzeJobDescription(jobDescriptionText);

    // Step 2: Analyze Resume (AI extracts all content)
    console.log('📄 Analyzing Resume...');
    const resumeAnalysis = await analyzeResume(resumeText, fileType);

    // Step 3: Match JD requirements against Resume (AI-powered, no hardcoding)
    console.log('🔍 AI-Powered Matching...');
    const matchResult = await matchJDToResumeAI(jdAnalysis, resumeAnalysis, resumeText);

    // Step 4: Run Comprehensive Analysis (Structure, Contact, Formatting, etc.)
    console.log('📊 Running Comprehensive Analysis...');
    const comprehensiveAnalysis = runComprehensiveAnalysis(resumeAnalysis, jdAnalysis, matchResult, resumeText);

    // Step 5: Generate AI-Powered Recruiter Tips (with fallback to rule-based)
    console.log('💡 Generating AI Recruiter Tips...');
    const recruiterTips = await generateAIRecruiterTips(resumeAnalysis, jdAnalysis, matchResult);

    // Step 6: Generate Recommendations
    console.log('📝 Generating Recommendations...');
    const recommendations = generateRecommendations(resumeAnalysis, jdAnalysis, matchResult);

    // Step 7: Generate Auto-Optimize Suggestions
    console.log('✨ Generating Optimization Suggestions...');
    const optimizeSuggestions = await generateOptimizeSuggestions(resumeAnalysis, jdAnalysis, matchResult);

    // Step 8: AI-Powered CV Enhancement (Jobscan-style)
    console.log('🔧 Generating CV Enhancement...');
    const cvEnhancement = await enhanceCV(resumeAnalysis, jdAnalysis, matchResult, resumeText);

    // Step 9: Generate Summary
    const { summary, strengths, weaknesses } = generateSummary(matchResult, resumeAnalysis, jdAnalysis);

    // Step 10: Create highlighted resume
    const highlightedResume = createHighlightedResume(resumeText, matchResult);

    // Step 11: Check ATS Compatibility
    const atsCompatibility = checkATSCompatibility(resumeAnalysis);

    console.log('✅ Analysis Complete!');

    return {
        jdAnalysis,
        resumeAnalysis,
        matchResult,
        comprehensiveAnalysis,
        recruiterTips,
        recommendations,
        optimizeSuggestions,
        cvEnhancement,
        summary,
        strengths,
        weaknesses,
        highlightedResume,
        analysisTimestamp: new Date().toISOString(),
        version: '3.0.0'
    };
}

/**
 * Generate summary based on analysis
 */
function generateSummary(
    matchResult: any,
    resumeAnalysis: any,
    jdAnalysis: any
): { summary: string; strengths: string[]; weaknesses: string[] } {
    const score = matchResult.overallScore;
    const { matched, missing } = matchResult.skills;

    let scoreLevel: string;
    if (score >= 80) scoreLevel = 'excellent';
    else if (score >= 65) scoreLevel = 'good';
    else if (score >= 50) scoreLevel = 'fair';
    else scoreLevel = 'needs improvement';

    const summary = `Your resume is a ${scoreLevel} match (${score}%) for the ${jdAnalysis.jobTitle} position. ` +
        `You matched ${matched.length} of ${matched.length + missing.length} required skills. ` +
        `${missing.length > 0 ? `Focus on adding: ${missing.slice(0, 3).map((s: any) => s.skill).join(', ')}.` : 'Great skill alignment!'}`;

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Strengths
    if (matchResult.breakdown.keywordMatch >= 70) {
        strengths.push(`Strong keyword match (${matchResult.breakdown.keywordMatch}%)`);
    }
    if (matchResult.experienceMatch.meetsRequirement) {
        strengths.push(`Experience meets requirements (${resumeAnalysis.totalYearsOfExperience} years)`);
    }
    if (resumeAnalysis.contentQuality.averageBulletScore >= 70) {
        strengths.push('High-quality bullet points with metrics');
    }
    if (matched.length >= 5) {
        strengths.push(`${matched.length} skills match job requirements`);
    }

    // Weaknesses
    if (missing.filter((s: any) => s.importance === 'required').length > 0) {
        weaknesses.push(`Missing ${missing.filter((s: any) => s.importance === 'required').length} required skills`);
    }
    if (!matchResult.experienceMatch.meetsRequirement) {
        weaknesses.push(`Experience gap: need ${matchResult.experienceMatch.requiredYears - matchResult.experienceMatch.candidateYears} more years`);
    }
    if (resumeAnalysis.contentQuality.bulletsWithMetrics < resumeAnalysis.contentQuality.totalBullets * 0.3) {
        weaknesses.push('Most bullet points lack measurable results');
    }
    if (resumeAnalysis.formatting.missingSections.length > 0) {
        weaknesses.push(`Missing sections: ${resumeAnalysis.formatting.missingSections.join(', ')}`);
    }

    return { summary, strengths, weaknesses };
}

/**
 * Create highlighted resume text
 */
function createHighlightedResume(resumeText: string, matchResult: any): HighlightedText[] {
    const highlighted: HighlightedText[] = [];
    const matchedSkills = matchResult.skills.matched.map((s: any) => s.skill.toLowerCase());

    // Split text into words
    const words = resumeText.split(/(\s+)/);

    words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (matchedSkills.includes(cleanWord)) {
            highlighted.push({ text: word, type: 'matched_skill' });
        } else if (/^\d+%|\$[\d,]+|\d+\+?$/.test(word)) {
            highlighted.push({ text: word, type: 'metric' });
        } else {
            highlighted.push({ text: word, type: 'normal' });
        }
    });

    return highlighted;
}

/**
 * Check ATS compatibility
 */
function checkATSCompatibility(resumeAnalysis: any): ATSCompatibility {
    const checks: ATSCheck[] = [];
    let passCount = 0;

    // File type check
    checks.push({
        name: 'File Format',
        status: resumeAnalysis.formatting.fileType === 'docx' ? 'pass' : 'warning',
        message: resumeAnalysis.formatting.fileType === 'docx'
            ? 'DOCX format (recommended)'
            : 'PDF format (generally compatible)',
        recommendation: resumeAnalysis.formatting.fileType !== 'docx'
            ? 'Consider using DOCX for better ATS parsing'
            : undefined
    });
    if (checks[checks.length - 1].status === 'pass') passCount++;

    // Contact info check
    checks.push({
        name: 'Contact Information',
        status: resumeAnalysis.formatting.hasEmail && resumeAnalysis.formatting.hasPhone ? 'pass' :
            resumeAnalysis.formatting.hasContactInfo ? 'warning' : 'fail',
        message: resumeAnalysis.formatting.hasEmail && resumeAnalysis.formatting.hasPhone
            ? 'Email and phone found'
            : 'Missing contact information',
        recommendation: !resumeAnalysis.formatting.hasContactInfo
            ? 'Add email and phone number'
            : undefined
    });
    if (checks[checks.length - 1].status === 'pass') passCount++;

    // Sections check
    checks.push({
        name: 'Standard Sections',
        status: resumeAnalysis.formatting.missingSections.length === 0 ? 'pass' : 'warning',
        message: resumeAnalysis.formatting.missingSections.length === 0
            ? 'All standard sections found'
            : `Missing: ${resumeAnalysis.formatting.missingSections.join(', ')}`,
        recommendation: resumeAnalysis.formatting.missingSections.length > 0
            ? 'Add missing sections for better ATS parsing'
            : undefined
    });
    if (checks[checks.length - 1].status === 'pass') passCount++;

    // Scanned PDF check
    checks.push({
        name: 'Text-Based Resume',
        status: resumeAnalysis.formatting.isScannedPdf ? 'fail' : 'pass',
        message: resumeAnalysis.formatting.isScannedPdf
            ? 'Resume appears to be scanned/image-based'
            : 'Resume is text-based and ATS readable',
        recommendation: resumeAnalysis.formatting.isScannedPdf
            ? 'Use a text-based document, not a scanned image'
            : undefined
    });
    if (checks[checks.length - 1].status === 'pass') passCount++;

    // Tables/columns check
    checks.push({
        name: 'Simple Layout',
        status: resumeAnalysis.formatting.hasTablesOrColumns ? 'warning' : 'pass',
        message: resumeAnalysis.formatting.hasTablesOrColumns
            ? 'Tables or columns detected'
            : 'Single column layout (recommended)',
        recommendation: resumeAnalysis.formatting.hasTablesOrColumns
            ? 'Use a single-column layout for better ATS compatibility'
            : undefined
    });
    if (checks[checks.length - 1].status === 'pass') passCount++;

    // Resume length check
    const wordCount = resumeAnalysis.contentQuality.wordCount;
    checks.push({
        name: 'Resume Length',
        status: wordCount >= 300 && wordCount <= 1000 ? 'pass' : 'warning',
        message: `${wordCount} words (~${resumeAnalysis.formatting.estimatedPages} page${resumeAnalysis.formatting.estimatedPages > 1 ? 's' : ''})`,
        recommendation: wordCount < 300 ? 'Add more detail' : wordCount > 1000 ? 'Consider trimming to 1-2 pages' : undefined
    });
    if (checks[checks.length - 1].status === 'pass') passCount++;

    // Determine overall
    let overall: 'excellent' | 'good' | 'fair' | 'poor';
    const passRate = passCount / checks.length;
    if (passRate >= 0.9) overall = 'excellent';
    else if (passRate >= 0.7) overall = 'good';
    else if (passRate >= 0.5) overall = 'fair';
    else overall = 'poor';

    return { overall, checks };
}

/**
 * Quick analysis for API route (lighter version if needed)
 */
export async function runQuickAnalysis(
    resumeText: string,
    jobDescriptionText: string
): Promise<{ score: number; matchedCount: number; missingCount: number; topMissing: string[] }> {
    const jdAnalysis = await analyzeJobDescription(jobDescriptionText);
    const resumeAnalysis = await analyzeResume(resumeText);
    const matchResult = await matchJDToResumeAI(jdAnalysis, resumeAnalysis, resumeText);

    return {
        score: matchResult.overallScore,
        matchedCount: matchResult.skills.matched.length,
        missingCount: matchResult.skills.missing.length,
        topMissing: matchResult.skills.missing.slice(0, 5).map(s => s.skill)
    };
}
