// Universal ATS Types - AI-Powered, No Hardcoding
// Works for ALL jobs, ALL industries, worldwide

/**
 * JD Analysis Result - Everything extracted dynamically from Job Description
 */
export interface JDAnalysis {
    // Job Information
    jobTitle: string;
    company?: string;
    jobLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive' | 'unknown';

    // Skills - Extracted dynamically from JD (no hardcoding)
    hardSkills: ExtractedSkill[];
    softSkills: ExtractedSkill[];

    // Requirements
    experience: ExperienceRequirement;
    education: EducationRequirement;
    certifications: string[];

    // Additional
    industryTerms: string[];
    responsibilities: string[];
    preferredQualifications: string[];
    requiredQualifications: string[];
}

/**
 * Skill extracted dynamically by AI
 */
export interface ExtractedSkill {
    name: string;
    importance: 'required' | 'preferred' | 'bonus';
    frequency: number; // How many times mentioned in JD
    context?: string; // The sentence where it was found
    variants?: string[]; // e.g., "React" -> ["React.js", "ReactJS"]
}

/**
 * Experience requirement extracted from JD
 */
export interface ExperienceRequirement {
    minimumYears?: number;
    maximumYears?: number;
    preferredYears?: number;
    description: string; // "3-5 years of experience in..."
    level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'any';
}

/**
 * Education requirement extracted from JD
 */
export interface EducationRequirement {
    degree: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'any' | 'not_specified';
    field?: string; // "Computer Science", "Engineering", etc.
    isRequired: boolean;
    description: string;
}

/**
 * Resume Analysis Result - Everything extracted dynamically from Resume
 */
export interface ResumeAnalysis {
    // Contact
    contact: {
        email?: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        portfolio?: string;
        location?: string;
    };

    // Professional Summary
    summary?: string;

    // Skills found in resume
    skills: ExtractedSkill[];

    // Experience
    experience: ExperienceEntry[];
    totalYearsOfExperience: number;

    // Education
    education: EducationEntry[];
    highestDegree: string;

    // Certifications
    certifications: string[];

    // Content Quality Metrics
    contentQuality: ContentQuality;

    // Formatting
    formatting: FormattingAnalysis;
}

/**
 * Work experience entry
 */
export interface ExperienceEntry {
    jobTitle: string;
    company: string;
    startDate?: string;
    endDate?: string;
    duration?: string; // "2 years 3 months"
    isCurrent: boolean;
    bulletPoints: BulletPoint[];
    skills: string[]; // Skills mentioned in this role
}

/**
 * Individual bullet point analysis
 */
export interface BulletPoint {
    text: string;
    hasActionVerb: boolean;
    actionVerb?: string;
    hasMeasurableResult: boolean;
    metrics?: string[]; // "40%", "$1M", "50+"
    hasWeakPhrase: boolean;
    weakPhrases?: string[];
    score: number; // 0-100
    suggestions?: string[];
}

/**
 * Education entry
 */
export interface EducationEntry {
    degree: string;
    field: string;
    institution: string;
    graduationDate?: string;
    gpa?: string;
}

/**
 * Content quality metrics
 */
export interface ContentQuality {
    actionVerbCount: number;
    totalBullets: number;
    bulletsWithMetrics: number;
    bulletsWithWeakPhrases: number;
    averageBulletScore: number;
    wordCount: number;
    uniqueSkillsCount: number;
}

/**
 * Formatting analysis
 */
export interface FormattingAnalysis {
    fileType: 'pdf' | 'docx';
    hasContactInfo: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    sectionsDetected: string[];
    missingSections: string[];
    isScannedPdf: boolean;
    hasTablesOrColumns: boolean;
    specialCharacterCount: number;
    estimatedPages: number;
}

/**
 * Match result between JD and Resume
 */
export interface MatchResult {
    // Overall Score
    overallScore: number; // 0-100

    // Score Breakdown
    breakdown: {
        keywordMatch: number;
        experienceMatch: number;
        educationMatch: number;
        skillsMatch: number;
        contentQuality: number;
    };

    // Skills Comparison
    skills: {
        matched: SkillMatch[];
        missing: SkillMatch[];
        extra: SkillMatch[]; // In resume but not required
    };

    // Experience Match
    experienceMatch: {
        meetsRequirement: boolean;
        candidateYears: number;
        requiredYears: number;
        gap?: string;
    };

    // Education Match
    educationMatch: {
        meetsRequirement: boolean;
        candidateDegree: string;
        requiredDegree: string;
        fieldMatch: boolean;
    };

    // Certification Match
    certificationMatch: {
        matched: string[];
        missing: string[];
    };

    // Job Level Match
    jobLevelMatch: {
        matches: boolean;
        candidateLevel: string;
        requiredLevel: string;
        recommendation?: string;
    };
}

/**
 * Skill match details
 */
export interface SkillMatch {
    skill: string;
    importance: 'required' | 'preferred' | 'bonus';
    foundInResume: boolean;
    resumeContext?: string; // Where in resume it was found
    jdFrequency?: number; // How many times mentioned in JD
    resumeFrequency?: number; // How many times mentioned in Resume
    matchedAs?: string; // What text explicitly matched (e.g. "ReactJS" for "React")
    matchType?: 'exact' | 'variant' | 'text_search' | 'variant_text' | 'synonym' | 'synonym_text' | 'partial'; // How the match was found
}

/**
 * Recruiter Tips
 */
export interface RecruiterTips {
    jobLevelMatch: RecruiterTip;
    measurableResults: RecruiterTip;
    resumeLength: RecruiterTip;
    resumeTone: RecruiterTip;
    webPresence: RecruiterTip;
    keywordOptimization: RecruiterTip;
    atsParsability: RecruiterTip;
}

export interface RecruiterTip {
    status: 'pass' | 'warning' | 'fail';
    title: string;
    current: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
}

/**
 * Auto-Optimize Suggestions
 */
export interface OptimizeSuggestion {
    type: 'bullet_rewrite' | 'add_keyword' | 'add_metric' | 'remove_weak_phrase' | 'rewrite_bullet' | 'quantify' | 'reorder' | 'remove' | 'general';
    original: string;
    suggested: string;
    reason: string;
    impact: 'high' | 'medium' | 'low' | number; // Impact level or expected score increase
}

/**
 * Enhanced Section for CV Optimization
 */
export interface EnhancedSection {
    sectionName: string;
    original: string;
    optimized: string;
    keywordsAdded: string[];
    improvementScore: number;
}

/**
 * CV Enhancement Result from the AI Enhancer
 */
export interface CVEnhancementResult {
    enhancedSections: EnhancedSection[];
    bulletRewrites: OptimizeSuggestion[];
    keywordIntegrations: OptimizeSuggestion[];
    overallImprovement: number;
}

/**
 * Complete Analysis Result
 */
export interface UniversalATSResult {
    // Analysis Components
    jdAnalysis: JDAnalysis;
    resumeAnalysis: ResumeAnalysis;
    matchResult: MatchResult;

    // Comprehensive Analysis (Structure, Contact, Formatting, etc.)
    comprehensiveAnalysis?: import('@/lib/comprehensive-analyzer').ComprehensiveAnalysis;

    // Recruiter Insights
    recruiterTips: RecruiterTips;

    // AI Recommendations
    recommendations: Recommendation[];
    optimizeSuggestions: OptimizeSuggestion[];
    cvEnhancement?: CVEnhancementResult;

    // Summary
    summary: string;
    strengths: string[];
    weaknesses: string[];

    // Highlighted Resume
    highlightedResume: HighlightedText[];

    // Metadata
    analysisTimestamp: string;
    version: string;
}

/**
 * For highlighted skills view
 */
export interface HighlightedText {
    text: string;
    type: 'matched_skill' | 'missing_skill' | 'action_verb' | 'metric' | 'weak_phrase' | 'normal';
}

/**
 * Recommendation item
 */
export interface Recommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: 'skills' | 'experience' | 'education' | 'formatting' | 'content' | 'keywords';
    title: string;
    description: string;
    actionItems: string[];
    expectedImpact: number;
}

/**
 * ATS Compatibility Check
 */
export interface ATSCompatibility {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    checks: ATSCheck[];
}

export interface ATSCheck {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
    recommendation?: string;
}
