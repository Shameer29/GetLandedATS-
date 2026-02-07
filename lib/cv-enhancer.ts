import 'server-only';
import { getGeminiModel } from './gemini';
import type {
    ResumeAnalysis,
    JDAnalysis,
    MatchResult,
    OptimizeSuggestion
} from '@/types/universal-ats';

/**
 * Enhanced CV Optimization Engine
 * Generates complete rewritten sections with missing keywords integrated
 * Works for ANY job type - no hardcoded values
 */

interface EnhancedSection {
    sectionName: string;
    original: string;
    optimized: string;
    keywordsAdded: string[];
    improvementScore: number;
}

interface CVEnhancementResult {
    enhancedSections: EnhancedSection[];
    bulletRewrites: OptimizeSuggestion[];
    keywordIntegrations: OptimizeSuggestion[];
    overallImprovement: number;
}

/**
 * Main CV Enhancement Function
 * Analyzes resume and generates optimized versions of weak sections
 */
export async function enhanceCV(
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis,
    matchResult: MatchResult,
    resumeText: string
): Promise<CVEnhancementResult> {
    const model = getGeminiModel();

    // Get all missing skills for integration
    const missingSkills = matchResult.skills.missing
        .map(s => ({ skill: s.skill, importance: s.importance }));

    // Get weak experience bullets
    const weakBullets: { text: string; company: string }[] = [];
    resumeAnalysis.experience.forEach(exp => {
        exp.bulletPoints.forEach(bp => {
            if (bp.score < 70 || bp.hasWeakPhrase || !bp.hasMeasurableResult) {
                weakBullets.push({ text: bp.text, company: exp.company });
            }
        });
    });

    // Generate enhanced bullet points with keywords integrated
    const bulletRewrites = await generateBulletRewrites(model, weakBullets, missingSkills, jdAnalysis);

    // Generate keyword integration suggestions
    const keywordIntegrations = await generateKeywordIntegrations(model, missingSkills, resumeAnalysis, jdAnalysis);

    // Generate enhanced sections if summary is weak
    const enhancedSections = await generateEnhancedSections(model, resumeAnalysis, jdAnalysis, missingSkills);

    // Calculate overall improvement
    const overallImprovement = calculateImprovement(bulletRewrites, keywordIntegrations, enhancedSections);

    return {
        enhancedSections,
        bulletRewrites,
        keywordIntegrations,
        overallImprovement
    };
}

/**
 * Generate AI-powered bullet point rewrites
 */
async function generateBulletRewrites(
    model: any,
    weakBullets: { text: string; company: string }[],
    missingSkills: { skill: string; importance: string }[],
    jdAnalysis: JDAnalysis
): Promise<OptimizeSuggestion[]> {
    if (weakBullets.length === 0) return [];

    const requiredSkills = missingSkills.filter(s => s.importance === 'required').map(s => s.skill);
    const preferredSkills = missingSkills.filter(s => s.importance === 'preferred').map(s => s.skill);

    const prompt = `You are an expert resume optimizer. Your task is to rewrite weak resume bullet points to be powerful, metric-driven, and keyword-optimized.

TARGET JOB: ${jdAnalysis.jobTitle}

MISSING REQUIRED KEYWORDS TO INTEGRATE:
${requiredSkills.join(', ') || 'None'}

MISSING PREFERRED KEYWORDS (integrate where natural):
${preferredSkills.slice(0, 5).join(', ') || 'None'}

WEAK BULLETS TO REWRITE:
${weakBullets.slice(0, 8).map((b, i) => `${i + 1}. "${b.text}"`).join('\n')}

RULES FOR REWRITING:
1. Start with a STRONG action verb (Led, Developed, Achieved, Engineered, Spearheaded, etc.)
2. Include SPECIFIC metrics (%, $, numbers, timeframes)
3. Integrate missing keywords naturally where they fit the context
4. Remove weak phrases like "Responsible for", "Helped with", "Worked on"
5. Make each bullet impactful and results-oriented
6. Keep bullets concise (1-2 lines max)
7. Do NOT make up fake metrics - use realistic placeholders like [X%], [$X], [N] if specific numbers unknown

Return a JSON array:
[
  {
    "type": "rewrite_bullet",
    "original": "exact original text",
    "suggested": "rewritten powerful bullet with metrics and keywords",
    "reason": "Brief explanation of improvements",
    "impact": "high" | "medium" | "low"
  }
]`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as OptimizeSuggestion[];
    } catch (error) {
        console.error('Error generating bullet rewrites:', error);
        return [];
    }
}

/**
 * Generate keyword integration suggestions
 */
async function generateKeywordIntegrations(
    model: any,
    missingSkills: { skill: string; importance: string }[],
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis
): Promise<OptimizeSuggestion[]> {
    if (missingSkills.length === 0) return [];

    const requiredMissing = missingSkills.filter(s => s.importance === 'required').slice(0, 5);
    if (requiredMissing.length === 0) return [];

    const prompt = `You are a resume keyword optimization expert. Generate specific sentences or phrases that naturally integrate missing required keywords into a resume.

TARGET JOB: ${jdAnalysis.jobTitle}

EXISTING SKILLS IN RESUME:
${resumeAnalysis.skills.map(s => s.name).join(', ')}

MISSING REQUIRED KEYWORDS THAT MUST BE ADDED:
${requiredMissing.map(s => s.skill).join(', ')}

EXPERIENCE CONTEXT:
${resumeAnalysis.experience.slice(0, 2).map(e => `- ${e.jobTitle} at ${e.company}`).join('\n')}

For each missing keyword, generate a natural sentence that:
1. Could be added to the Skills section OR integrated into an experience bullet
2. Shows practical application of the skill
3. Sounds authentic, not keyword-stuffed
4. Is relevant to the job context

Return a JSON array:
[
  {
    "type": "add_keyword",
    "original": "",
    "suggested": "Natural sentence integrating the keyword in context",
    "reason": "Adds required skill: [skill name]",
    "impact": "high"
  }
]`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as OptimizeSuggestion[];
    } catch (error) {
        console.error('Error generating keyword integrations:', error);
        return [];
    }
}

/**
 * Generate enhanced sections (summary, skills)
 */
async function generateEnhancedSections(
    model: any,
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis,
    missingSkills: { skill: string; importance: string }[]
): Promise<EnhancedSection[]> {
    const sections: EnhancedSection[] = [];

    // Enhance Summary if exists and weak
    if (resumeAnalysis.summary && resumeAnalysis.summary.length < 200) {
        const enhancedSummary = await enhanceSummarySection(model, resumeAnalysis, jdAnalysis, missingSkills);
        if (enhancedSummary) sections.push(enhancedSummary);
    }

    return sections;
}

/**
 * Enhance the professional summary section
 */
async function enhanceSummarySection(
    model: any,
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis,
    missingSkills: { skill: string; importance: string }[]
): Promise<EnhancedSection | null> {
    const requiredKeywords = missingSkills
        .filter(s => s.importance === 'required')
        .slice(0, 5)
        .map(s => s.skill);

    const prompt = `You are a professional resume writer. Rewrite this professional summary to be powerful and keyword-optimized.

CURRENT SUMMARY:
"${resumeAnalysis.summary || 'No summary provided'}"

TARGET JOB: ${jdAnalysis.jobTitle}
YEARS OF EXPERIENCE: ${resumeAnalysis.experience.length > 0 ? resumeAnalysis.experience[0].duration : 'N/A'}
KEY SKILLS TO EMPHASIZE: ${requiredKeywords.join(', ') || 'Based on experience'}

RULES:
1. Keep it 3-4 sentences maximum
2. Start with years of experience and area of expertise
3. Highlight key achievements
4. Naturally integrate required keywords
5. End with value proposition for the employer
6. Be specific, not generic
7. Do not use first person (I, my, me)

Return a JSON object:
{
  "sectionName": "Professional Summary",
  "original": "original summary text",
  "optimized": "new powerful summary",
  "keywordsAdded": ["list", "of", "keywords", "integrated"],
  "improvementScore": 85
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as EnhancedSection;
    } catch (error) {
        console.error('Error enhancing summary:', error);
        return null;
    }
}

/**
 * Calculate overall improvement score
 */
function calculateImprovement(
    bulletRewrites: OptimizeSuggestion[],
    keywordIntegrations: OptimizeSuggestion[],
    enhancedSections: EnhancedSection[]
): number {
    let score = 0;

    // Bullet rewrites impact
    bulletRewrites.forEach(b => {
        if (b.impact === 'high') score += 5;
        else if (b.impact === 'medium') score += 3;
        else score += 1;
    });

    // Keyword integrations impact
    keywordIntegrations.forEach(k => {
        if (k.impact === 'high') score += 8;
        else if (k.impact === 'medium') score += 4;
        else score += 2;
    });

    // Section enhancements
    enhancedSections.forEach(s => {
        score += Math.floor(s.improvementScore / 10);
    });

    return Math.min(100, score);
}
