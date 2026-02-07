import 'server-only';
import type { ResumeAnalysis, JDAnalysis, MatchResult } from '@/types/universal-ats';

/**
 * Comprehensive ATS Analysis - All Checks in One Place
 * Covers EVERY aspect that premium ATS tools analyze
 */

// ============ TYPE DEFINITIONS ============

export interface ComprehensiveAnalysis {
    resumeStructure: ResumeStructureAnalysis;
    contactInfo: ContactInfoAnalysis;
    formatting: FormattingAnalysis;
    contentQuality: ContentQualityAnalysis;
    searchability: SearchabilityAnalysis;
    careerAnalysis: CareerAnalysis;
    summaryAnalysis: SummaryAnalysis;
    overallReadiness: OverallReadiness;
}

export interface ResumeStructureAnalysis {
    detectedSections: SectionInfo[];
    missingSections: string[];
    sectionOrder: SectionOrderCheck;
    structureScore: number;
}

export interface SectionInfo {
    name: string;
    detected: boolean;
    position: number;
    wordCount: number;
    isOptimal: boolean;
}

export interface SectionOrderCheck {
    isOptimal: boolean;
    currentOrder: string[];
    recommendedOrder: string[];
    issues: string[];
}

export interface ContactInfoAnalysis {
    hasEmail: boolean;
    hasProfessionalEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasLocation: boolean;
    hasPortfolio: boolean;
    contactScore: number;
    issues: string[];
}

export interface FormattingAnalysis {
    wordCount: number;
    estimatedPages: number;
    isLengthOptimal: boolean;
    bulletPointCount: number;
    avgBulletLength: number;
    hasConsistentDates: boolean;
    hasUnusualCharacters: boolean;
    formattingScore: number;
    issues: string[];
}

export interface ContentQualityAnalysis {
    actionVerbPercentage: number;
    bulletsWithMetrics: number;
    totalBullets: number;
    metricsPercentage: number;
    weakPhrasesCount: number;
    personalPronounCount: number;
    overusedWords: { word: string; count: number }[];
    contentScore: number;
    issues: string[];
}

export interface SearchabilityAnalysis {
    keywordDensity: number;
    topKeywordsFound: { keyword: string; jdCount: number; resumeCount: number; ratio: number }[];
    skillsInSkillsSection: number;
    skillsElsewhere: number;
    searchabilityScore: number;
    issues: string[];
}

export interface CareerAnalysis {
    titleAlignment: number;
    hasCareerProgression: boolean;
    employmentGaps: { from: string; to: string; months: number }[];
    avgTenure: number;
    jobCount: number;
    careerScore: number;
    issues: string[];
}

export interface SummaryAnalysis {
    hasSummary: boolean;
    summaryLength: number;
    isLengthOptimal: boolean;
    containsKeywords: boolean;
    keywordsInSummary: string[];
    isGeneric: boolean;
    summaryScore: number;
    issues: string[];
}

export interface OverallReadiness {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    strengths: string[];
    improvements: string[];
    criticalIssues: string[];
}

// ============ MAIN ANALYSIS FUNCTION ============

export function runComprehensiveAnalysis(
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis,
    matchResult: MatchResult,
    resumeText: string
): ComprehensiveAnalysis {
    const resumeStructure = analyzeResumeStructure(resumeAnalysis, resumeText);
    const contactInfo = analyzeContactInfo(resumeText);
    const formatting = analyzeFormatting(resumeAnalysis, resumeText);
    const contentQuality = analyzeContentQuality(resumeAnalysis);
    const searchability = analyzeSearchability(matchResult, resumeAnalysis);
    const careerAnalysis = analyzeCareer(resumeAnalysis, jdAnalysis);
    const summaryAnalysis = analyzeSummary(resumeAnalysis, jdAnalysis);

    const overallReadiness = calculateOverallReadiness(
        resumeStructure,
        contactInfo,
        formatting,
        contentQuality,
        searchability,
        careerAnalysis,
        summaryAnalysis
    );

    return {
        resumeStructure,
        contactInfo,
        formatting,
        contentQuality,
        searchability,
        careerAnalysis,
        summaryAnalysis,
        overallReadiness
    };
}

// ============ STRUCTURE ANALYSIS ============

function analyzeResumeStructure(resumeAnalysis: ResumeAnalysis, resumeText: string): ResumeStructureAnalysis {
    const textLower = resumeText.toLowerCase();

    const sectionPatterns: { name: string; patterns: string[]; required: boolean }[] = [
        { name: 'Contact', patterns: ['email', 'phone', '@', 'linkedin'], required: true },
        { name: 'Summary', patterns: ['summary', 'objective', 'profile', 'about'], required: true },
        { name: 'Experience', patterns: ['experience', 'work history', 'employment', 'professional experience'], required: true },
        { name: 'Education', patterns: ['education', 'academic', 'degree', 'university', 'college'], required: true },
        { name: 'Skills', patterns: ['skills', 'technical skills', 'core competencies', 'expertise'], required: true },
        { name: 'Projects', patterns: ['projects', 'portfolio', 'personal projects'], required: false },
        { name: 'Certifications', patterns: ['certifications', 'certificates', 'licenses'], required: false },
        { name: 'Awards', patterns: ['awards', 'honors', 'achievements', 'recognition'], required: false },
        { name: 'Publications', patterns: ['publications', 'papers', 'articles'], required: false },
        { name: 'Languages', patterns: ['languages', 'language proficiency'], required: false },
    ];

    const detectedSections: SectionInfo[] = [];
    const missingSections: string[] = [];

    sectionPatterns.forEach((section, index) => {
        const detected = section.patterns.some(p => textLower.includes(p));
        detectedSections.push({
            name: section.name,
            detected,
            position: detected ? index : -1,
            wordCount: 0, // Simplified
            isOptimal: detected
        });
        if (section.required && !detected) {
            missingSections.push(section.name);
        }
    });

    const currentOrder = detectedSections.filter(s => s.detected).map(s => s.name);
    const recommendedOrder = ['Contact', 'Summary', 'Skills', 'Experience', 'Education', 'Projects', 'Certifications'];

    const sectionOrder: SectionOrderCheck = {
        isOptimal: currentOrder.slice(0, 5).join(',') === recommendedOrder.slice(0, 5).join(','),
        currentOrder,
        recommendedOrder,
        issues: []
    };

    if (!sectionOrder.isOptimal && currentOrder.length >= 3) {
        sectionOrder.issues.push('Section order may not be optimal for ATS scanning');
    }

    const structureScore = Math.round(
        ((detectedSections.filter(s => s.detected && s.name !== 'Awards' && s.name !== 'Publications').length / 6) * 100)
    );

    return {
        detectedSections,
        missingSections,
        sectionOrder,
        structureScore: Math.min(100, structureScore)
    };
}

// ============ CONTACT INFO ANALYSIS ============

function analyzeContactInfo(resumeText: string): ContactInfoAnalysis {
    const text = resumeText.toLowerCase();
    const issues: string[] = [];

    // Email detection
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailRegex.test(resumeText);
    const emailMatch = resumeText.match(emailRegex);

    // Check if email is professional
    const unprofessionalPatterns = ['69', '420', 'sexy', 'hot', 'cute', 'baby', 'love', 'xxx'];
    const hasProfessionalEmail = hasEmail && !unprofessionalPatterns.some(p =>
        emailMatch?.[0]?.toLowerCase().includes(p)
    );

    // Phone detection
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const hasPhone = phoneRegex.test(resumeText);

    // LinkedIn detection
    const hasLinkedIn = text.includes('linkedin.com') || text.includes('linkedin://');

    // Location detection
    const hasLocation = /\b(city|state|country|london|new york|remote|hybrid|onsite)\b/i.test(text) ||
        /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(resumeText); // City, ST format

    // Portfolio detection
    const hasPortfolio = text.includes('github') || text.includes('portfolio') ||
        text.includes('behance') || text.includes('dribbble');

    if (!hasEmail) issues.push('No email address found');
    if (hasEmail && !hasProfessionalEmail) issues.push('Email may not appear professional');
    if (!hasPhone) issues.push('No phone number found');
    if (!hasLinkedIn) issues.push('No LinkedIn profile URL found');
    if (!hasLocation) issues.push('No location information found');

    const contactScore = [hasEmail, hasProfessionalEmail, hasPhone, hasLinkedIn, hasLocation]
        .filter(Boolean).length * 20;

    return {
        hasEmail,
        hasProfessionalEmail: hasEmail ? hasProfessionalEmail : false,
        hasPhone,
        hasLinkedIn,
        hasLocation,
        hasPortfolio,
        contactScore,
        issues
    };
}

// ============ FORMATTING ANALYSIS ============

function analyzeFormatting(resumeAnalysis: ResumeAnalysis, resumeText: string): FormattingAnalysis {
    const issues: string[] = [];

    const wordCount = resumeText.split(/\s+/).filter(w => w.length > 0).length;
    const estimatedPages = Math.ceil(wordCount / 500); // ~500 words per page

    const isLengthOptimal = wordCount >= 300 && wordCount <= 1000;
    if (wordCount < 300) issues.push('Resume may be too short (under 300 words)');
    if (wordCount > 1000) issues.push('Resume may be too long (over 1000 words, consider condensing)');

    // Count bullet points (lines starting with common bullet chars)
    const bulletPatterns = /^[\s]*[•\-\*\►\◆\○\●\★]/gm;
    const bulletPointCount = (resumeText.match(bulletPatterns) || []).length;

    // Average bullet length
    const bullets = resumeText.split('\n').filter(line => /^[\s]*[•\-\*\►]/.test(line));
    const avgBulletLength = bullets.length > 0
        ? Math.round(bullets.reduce((sum, b) => sum + b.length, 0) / bullets.length)
        : 0;

    if (avgBulletLength > 150) issues.push('Some bullet points may be too long (aim for under 150 characters)');
    if (avgBulletLength < 30 && bullets.length > 0) issues.push('Bullet points may be too short - add more detail');

    // Date consistency check
    const datePatterns = [
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi, // Jan 2020
        /\b\d{2}\/\d{4}\b/g, // 01/2020
        /\b\d{4}\s*-\s*(Present|\d{4})\b/gi, // 2020 - Present
    ];
    const dateFormats = datePatterns.map(p => (resumeText.match(p) || []).length);
    const hasConsistentDates = dateFormats.filter(c => c > 0).length <= 1;
    if (!hasConsistentDates) issues.push('Date formatting is inconsistent - use one format throughout');

    // Unusual characters (potential font issues)
    const unusualChars = /[^\x00-\x7F]/g;
    const hasUnusualCharacters = (resumeText.match(unusualChars) || []).length > 10;
    if (hasUnusualCharacters) issues.push('Unusual characters detected - may indicate font/encoding issues');

    const formattingScore = Math.round(
        (isLengthOptimal ? 25 : 10) +
        (bulletPointCount >= 10 ? 25 : bulletPointCount * 2.5) +
        (hasConsistentDates ? 25 : 10) +
        (!hasUnusualCharacters ? 25 : 10)
    );

    return {
        wordCount,
        estimatedPages,
        isLengthOptimal,
        bulletPointCount,
        avgBulletLength,
        hasConsistentDates,
        hasUnusualCharacters,
        formattingScore: Math.min(100, formattingScore),
        issues
    };
}

// ============ CONTENT QUALITY ANALYSIS ============

function analyzeContentQuality(resumeAnalysis: ResumeAnalysis): ContentQualityAnalysis {
    const issues: string[] = [];

    const { contentQuality } = resumeAnalysis;
    const totalBullets = contentQuality.totalBullets || 1;
    const actionVerbPercentage = Math.round((contentQuality.actionVerbCount / totalBullets) * 100);
    const metricsPercentage = Math.round((contentQuality.bulletsWithMetrics / totalBullets) * 100);

    if (actionVerbPercentage < 70) {
        issues.push(`Only ${actionVerbPercentage}% of bullets start with action verbs (aim for 70%+)`);
    }

    if (metricsPercentage < 40) {
        issues.push(`Only ${metricsPercentage}% of bullets contain measurable results (aim for 40%+)`);
    }

    if (contentQuality.bulletsWithWeakPhrases > 0) {
        issues.push(`${contentQuality.bulletsWithWeakPhrases} bullets contain weak phrases - rewrite them`);
    }

    // Simplified overused words (in real implementation, analyze text)
    const overusedWords: { word: string; count: number }[] = [];

    const contentScore = Math.round(
        (actionVerbPercentage * 0.3) +
        (metricsPercentage * 0.4) +
        (contentQuality.bulletsWithWeakPhrases === 0 ? 30 : 15)
    );

    return {
        actionVerbPercentage,
        bulletsWithMetrics: contentQuality.bulletsWithMetrics,
        totalBullets,
        metricsPercentage,
        weakPhrasesCount: contentQuality.bulletsWithWeakPhrases,
        personalPronounCount: 0, // Would need text analysis
        overusedWords,
        contentScore: Math.min(100, contentScore),
        issues
    };
}

// ============ SEARCHABILITY ANALYSIS ============

function analyzeSearchability(matchResult: MatchResult, resumeAnalysis: ResumeAnalysis): SearchabilityAnalysis {
    const issues: string[] = [];

    const matched = matchResult.skills.matched;
    const missing = matchResult.skills.missing;
    const total = matched.length + missing.length;

    const keywordDensity = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    // Top keywords analysis
    const topKeywordsFound = matched.slice(0, 10).map(skill => ({
        keyword: skill.skill,
        jdCount: skill.jdFrequency || 1,
        resumeCount: skill.resumeFrequency || 0,
        ratio: skill.resumeFrequency && skill.jdFrequency
            ? Math.round((skill.resumeFrequency / skill.jdFrequency) * 100) / 100
            : 0
    }));

    // Skills in skills section vs elsewhere
    const skillsInSkillsSection = resumeAnalysis.skills.length;
    const skillsElsewhere = matched.length - skillsInSkillsSection;

    if (keywordDensity < 60) {
        issues.push(`Keyword match rate is ${keywordDensity}% - aim for at least 60%`);
    }

    if (missing.filter(m => m.importance === 'required').length > 3) {
        issues.push(`${missing.filter(m => m.importance === 'required').length} required skills are missing`);
    }

    const searchabilityScore = Math.round(keywordDensity * 0.7 + (skillsInSkillsSection > 5 ? 30 : skillsInSkillsSection * 6));

    return {
        keywordDensity,
        topKeywordsFound,
        skillsInSkillsSection,
        skillsElsewhere: Math.max(0, skillsElsewhere),
        searchabilityScore: Math.min(100, searchabilityScore),
        issues
    };
}

// ============ CAREER ANALYSIS ============

function analyzeCareer(resumeAnalysis: ResumeAnalysis, jdAnalysis: JDAnalysis): CareerAnalysis {
    const issues: string[] = [];
    const experience = resumeAnalysis.experience;

    // Title alignment (simplified - check if any experience title is similar to JD title)
    const jdTitleWords = jdAnalysis.jobTitle.toLowerCase().split(/\s+/);
    let titleMatch = 0;
    experience.forEach(exp => {
        const expTitleWords = exp.jobTitle.toLowerCase().split(/\s+/);
        const commonWords = jdTitleWords.filter(w => expTitleWords.includes(w) && w.length > 3);
        titleMatch = Math.max(titleMatch, (commonWords.length / jdTitleWords.length) * 100);
    });
    const titleAlignment = Math.round(titleMatch);

    if (titleAlignment < 30) {
        issues.push('Job titles in resume do not closely match target job title');
    }

    // Career progression (simplified)
    const hasCareerProgression = experience.length >= 2;

    // Employment gaps would require date parsing - simplified here
    const employmentGaps: { from: string; to: string; months: number }[] = [];

    // Average tenure
    const jobCount = experience.length;
    const avgTenure = jobCount > 0 ? 24 : 0; // Simplified, would need date parsing

    if (jobCount > 5 && avgTenure < 12) {
        issues.push('Frequent job changes detected - consider explaining transitions');
    }

    const careerScore = Math.round(
        (titleAlignment * 0.4) +
        (hasCareerProgression ? 30 : 15) +
        (employmentGaps.length === 0 ? 30 : 15)
    );

    return {
        titleAlignment,
        hasCareerProgression,
        employmentGaps,
        avgTenure,
        jobCount,
        careerScore: Math.min(100, careerScore),
        issues
    };
}

// ============ SUMMARY ANALYSIS ============

function analyzeSummary(resumeAnalysis: ResumeAnalysis, jdAnalysis: JDAnalysis): SummaryAnalysis {
    const issues: string[] = [];

    const summary = resumeAnalysis.summary || '';
    const hasSummary = summary.length > 20;
    const summaryLength = summary.split(/\s+/).length;

    const isLengthOptimal = summaryLength >= 30 && summaryLength <= 80;
    if (hasSummary && summaryLength < 30) issues.push('Summary is too short - expand to 30-80 words');
    if (summaryLength > 80) issues.push('Summary is too long - condense to 30-80 words');
    if (!hasSummary) issues.push('No professional summary found - add one');

    // Check for keywords in summary
    const summaryLower = summary.toLowerCase();
    const jdSkills = [...jdAnalysis.hardSkills, ...jdAnalysis.softSkills]
        .filter(s => s.importance === 'required')
        .slice(0, 10);

    const keywordsInSummary = jdSkills
        .filter(s => summaryLower.includes(s.name.toLowerCase()))
        .map(s => s.name);

    const containsKeywords = keywordsInSummary.length >= 2;
    if (hasSummary && !containsKeywords) {
        issues.push('Summary should contain more keywords from the job description');
    }

    // Generic summary detection (simplified)
    const genericPhrases = ['team player', 'hard worker', 'results-driven', 'self-motivated', 'detail-oriented'];
    const genericCount = genericPhrases.filter(p => summaryLower.includes(p)).length;
    const isGeneric = genericCount >= 2;
    if (isGeneric) issues.push('Summary contains too many generic phrases - be more specific');

    const summaryScore = Math.round(
        (hasSummary ? 30 : 0) +
        (isLengthOptimal ? 25 : 10) +
        (containsKeywords ? 25 : 10) +
        (!isGeneric ? 20 : 5)
    );

    return {
        hasSummary,
        summaryLength,
        isLengthOptimal,
        containsKeywords,
        keywordsInSummary,
        isGeneric,
        summaryScore: Math.min(100, summaryScore),
        issues
    };
}

// ============ OVERALL READINESS ============

function calculateOverallReadiness(
    resumeStructure: ResumeStructureAnalysis,
    contactInfo: ContactInfoAnalysis,
    formatting: FormattingAnalysis,
    contentQuality: ContentQualityAnalysis,
    searchability: SearchabilityAnalysis,
    careerAnalysis: CareerAnalysis,
    summaryAnalysis: SummaryAnalysis
): OverallReadiness {
    const scores = [
        resumeStructure.structureScore,
        contactInfo.contactScore,
        formatting.formattingScore,
        contentQuality.contentScore,
        searchability.searchabilityScore,
        careerAnalysis.careerScore,
        summaryAnalysis.summaryScore
    ];

    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
        overallScore >= 85 ? 'A' :
            overallScore >= 70 ? 'B' :
                overallScore >= 55 ? 'C' :
                    overallScore >= 40 ? 'D' : 'F';

    // Collect all issues
    const allIssues = [
        ...resumeStructure.missingSections.map(s => `Missing ${s} section`),
        ...contactInfo.issues,
        ...formatting.issues,
        ...contentQuality.issues,
        ...searchability.issues,
        ...careerAnalysis.issues,
        ...summaryAnalysis.issues
    ];

    // Categorize
    const criticalIssues = allIssues.filter(i =>
        i.includes('missing') || i.includes('No email') || i.includes('required skills')
    );

    const improvements = allIssues.filter(i => !criticalIssues.includes(i));

    // Identify strengths
    const strengths: string[] = [];
    if (contentQuality.actionVerbPercentage >= 70) strengths.push('Strong use of action verbs');
    if (contentQuality.metricsPercentage >= 40) strengths.push('Good use of quantified achievements');
    if (searchability.keywordDensity >= 70) strengths.push('Excellent keyword optimization');
    if (contactInfo.contactScore >= 80) strengths.push('Complete contact information');
    if (resumeStructure.structureScore >= 80) strengths.push('Well-structured resume');

    return {
        score: overallScore,
        grade,
        strengths,
        improvements,
        criticalIssues
    };
}
