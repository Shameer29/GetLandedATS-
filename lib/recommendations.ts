import 'server-only';
import { getGeminiModel } from './gemini';
import {
    safeParseAndValidate,
    validateOptimizeSuggestions,
    createErrorSuggestion,
    verifySuggestionQuality,
    type ValidatedOptimizeSuggestion
} from './ai-validation';
import type {
    OptimizeSuggestion,
    Recommendation,
    ResumeAnalysis,
    JDAnalysis,
    MatchResult
} from '@/types/universal-ats';

/**
 * Generate AI-powered optimization suggestions
 * Provides specific, actionable recommendations to improve resume
 * 
 * PRODUCTION QUALITY:
 * - All outputs validated against strict schema
 * - No hallucinations or unverified claims
 * - Graceful error handling with user-facing messages
 */
export async function generateOptimizeSuggestions(
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis,
    matchResult: MatchResult
): Promise<OptimizeSuggestion[]> {
    const model = getGeminiModel();

    // Get weak bullets that need improvement
    const weakBullets: string[] = [];
    resumeAnalysis.experience.forEach(exp => {
        exp.bulletPoints.forEach(bp => {
            if (bp.score < 70 || bp.hasWeakPhrase) {
                weakBullets.push(bp.text);
            }
        });
    });

    // Get missing required skills
    const missingRequired = matchResult.skills.missing
        .filter(s => s.importance === 'required')
        .map(s => s.skill);

    const prompt = `You are a professional resume optimization expert helping students improve their resumes for job applications.

WEAK BULLET POINTS NEEDING IMPROVEMENT:
${weakBullets.slice(0, 5).map((bp, i) => `${i + 1}. "${bp}"`).join('\n')}

MISSING REQUIRED SKILLS TO ADD:
${missingRequired.slice(0, 5).join(', ')}

JOB TITLE: ${jdAnalysis.jobTitle}

CRITICAL RULES (MANDATORY):
1. Only suggest changes you are 100% confident will improve the resume
2. NEVER fabricate skills, experience, or achievements the candidate doesn't have
3. All suggested metrics must be realistic and achievable (no "increased by 100%" unless justified)
4. Suggestions must be specific, actionable, and immediately applicable
5. Each suggestion must have clear "before" and "after" examples
6. Impact scores must be justified (0-20 scale, where 20 = critical improvement)
7. Return ONLY valid JSON - no explanations, comments, or text outside the JSON structure

For each weak bullet, provide a rewritten version that:
1. Starts with a strong action verb (Led, Developed, Built, Increased, Achieved)
2. Includes measurable results when possible (%, $, numbers) - but only if realistic
3. Removes weak phrases like "Responsible for", "Helped with", "Worked on"
4. Is specific and impactful
5. Maintains honesty - don't exaggerate or fabricate

For missing skills, suggest how to naturally incorporate them:
1. Only if the candidate likely has related experience
2. Provide context of how the skill might have been used
3. Don't suggest adding skills the candidate clearly doesn't have

Return a JSON array (maximum 5 suggestions):
[
  {
    "type": "bullet_rewrite",
    "original": "exact original bullet text",
    "suggested": "improved bullet with action verb and metrics",
    "reason": "specific explanation of why this is better (mention what was fixed)",
    "impact": 10
  },
  {
    "type": "add_keyword",
    "original": "",
    "suggested": "Natural sentence incorporating the missing skill with context",
    "reason": "Adds required skill [skill name] which is critical for this role",
    "impact": 15
  }
]

VALIDATION REQUIREMENTS:
- Each suggestion must pass quality checks
- Reason must be at least 10 characters and explain the improvement
- Impact must be 0-20 (realistic assessment)
- Suggested text must be substantive (minimum 10 characters)
- No placeholder text, lorem ipsum, or generic examples

Return ONLY the JSON array, nothing else.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Use safe parsing with validation
        const validated = safeParseAndValidate(
            text,
            validateOptimizeSuggestions,
            'optimize-suggestions'
        );

        // Additional quality verification
        const qualityFiltered = validated.filter(suggestion => {
            const isQuality = verifySuggestionQuality(suggestion);
            if (!isQuality) {
                console.warn('[AI Suggestions] Filtered low-quality suggestion:', suggestion);
            }
            return isQuality;
        });

        if (qualityFiltered.length === 0) {
            console.warn('[AI Suggestions] All suggestions filtered out due to quality issues');
            return [createErrorSuggestion('AI generated suggestions did not meet quality standards. Please try again.')];
        }

        console.log(`✓ [AI Suggestions] Generated ${qualityFiltered.length} validated suggestions`);
        return qualityFiltered as OptimizeSuggestion[];

    } catch (error: any) {
        console.error('[AI Suggestions] Generation failed:', error.message);

        // Return user-friendly error instead of empty array
        return [createErrorSuggestion(
            'Unable to generate AI suggestions at this time. This could be due to a temporary issue. Please try again in a moment.'
        ) as OptimizeSuggestion];
    }
}

// Threshold constants (documented in recruiter-tips.ts)
const METRICS_THRESHOLD = 0.50;
const WEAK_PHRASE_THRESHOLD = 0.20;
const ACTION_VERB_THRESHOLD = 0.70;

/**
 * Generate prioritized recommendations
 * Uses documented thresholds based on industry best practices
 */
export function generateRecommendations(
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis,
    matchResult: MatchResult
): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Skill-based recommendations
    const missingRequired = matchResult.skills.missing.filter(s => s.importance === 'required');
    if (missingRequired.length > 0) {
        recommendations.push({
            id: 'add-required-skills',
            priority: 'high',
            category: 'skills',
            title: 'Add Required Skills',
            description: `${missingRequired.length} required skills are missing from your resume`,
            actionItems: missingRequired.slice(0, 5).map(s =>
                `Add "${s.skill}" to your resume with context of how you used it`
            ),
            expectedImpact: Math.min(20, missingRequired.length * 5)
        });
    }

    const missingPreferred = matchResult.skills.missing.filter(s => s.importance === 'preferred');
    if (missingPreferred.length > 0) {
        recommendations.push({
            id: 'add-preferred-skills',
            priority: 'medium',
            category: 'skills',
            title: 'Add Preferred Skills',
            description: `${missingPreferred.length} preferred skills would strengthen your application`,
            actionItems: missingPreferred.slice(0, 3).map(s =>
                `Consider adding "${s.skill}" if you have experience with it`
            ),
            expectedImpact: Math.min(10, missingPreferred.length * 2)
        });
    }

    // Content quality recommendations
    const { bulletsWithMetrics, totalBullets, bulletsWithWeakPhrases, actionVerbCount } = resumeAnalysis.contentQuality;

    if (bulletsWithMetrics < totalBullets * METRICS_THRESHOLD) {
        recommendations.push({
            id: 'add-metrics',
            priority: 'high',
            category: 'content',
            title: 'Add Measurable Results',
            description: `Only ${bulletsWithMetrics} of ${totalBullets} bullet points include metrics`,
            actionItems: [
                'Quantify achievements with percentages: "Increased sales by 40%"',
                'Include dollar amounts: "Saved $50K annually"',
                'Add specific numbers: "Managed team of 15 engineers"'
            ],
            expectedImpact: 15
        });
    }

    if (bulletsWithWeakPhrases > totalBullets * WEAK_PHRASE_THRESHOLD) {
        recommendations.push({
            id: 'remove-weak-phrases',
            priority: 'medium',
            category: 'content',
            title: 'Remove Weak Phrases',
            description: `${bulletsWithWeakPhrases} bullets contain weak phrases like "Responsible for"`,
            actionItems: [
                'Replace "Responsible for managing" with "Managed"',
                'Replace "Helped with" with "Contributed to" or "Developed"',
                'Start each bullet with a strong action verb'
            ],
            expectedImpact: 10
        });
    }

    if (actionVerbCount < totalBullets * ACTION_VERB_THRESHOLD) {
        recommendations.push({
            id: 'add-action-verbs',
            priority: 'medium',
            category: 'content',
            title: 'Use Strong Action Verbs',
            description: `Only ${actionVerbCount} of ${totalBullets} bullets start with action verbs`,
            actionItems: [
                'Start bullets with verbs like: Led, Developed, Built, Increased, Achieved',
                'Avoid starting with "I" or passive phrases',
                'Use past tense for previous roles, present tense for current role'
            ],
            expectedImpact: 8
        });
    }

    // Experience match
    if (!matchResult.experienceMatch.meetsRequirement) {
        recommendations.push({
            id: 'experience-gap',
            priority: 'high',
            category: 'experience',
            title: 'Address Experience Gap',
            description: `You have ${matchResult.experienceMatch.candidateYears} years, job requires ${matchResult.experienceMatch.requiredYears} years`,
            actionItems: [
                'Highlight transferable skills from related experience',
                'Include relevant internships, projects, or freelance work',
                'Emphasize rapid learning and achievements despite shorter tenure'
            ],
            expectedImpact: 15
        });
    }

    // Formatting recommendations
    const { missingSections, hasLinkedIn, isScannedPdf, hasTablesOrColumns } = resumeAnalysis.formatting;

    if (missingSections.length > 0) {
        recommendations.push({
            id: 'add-sections',
            priority: 'medium',
            category: 'formatting',
            title: 'Add Missing Sections',
            description: `Missing sections: ${missingSections.join(', ')}`,
            actionItems: missingSections.map(s => `Add a ${s} section to your resume`),
            expectedImpact: 5
        });
    }

    if (!hasLinkedIn) {
        recommendations.push({
            id: 'add-linkedin',
            priority: 'low',
            category: 'formatting',
            title: 'Add LinkedIn URL',
            // Conservative language - no unverified statistics
            description: 'Most recruiters check LinkedIn profiles during candidate evaluation',
            actionItems: ['Add your LinkedIn profile URL in the contact section'],
            expectedImpact: 3
        });
    }

    if (isScannedPdf) {
        recommendations.push({
            id: 'fix-scanned-pdf',
            priority: 'high',
            category: 'formatting',
            title: 'Resume Not ATS-Readable',
            description: 'Your resume appears to be a scanned image, which ATS cannot read',
            actionItems: [
                'Use a text-based PDF or DOCX format',
                'Do not submit image-based resumes',
                'Recreate your resume in Word or Google Docs'
            ],
            expectedImpact: 30
        });
    }

    if (hasTablesOrColumns) {
        recommendations.push({
            id: 'fix-tables',
            priority: 'medium',
            category: 'formatting',
            title: 'Avoid Tables & Columns',
            description: 'Tables and columns may cause ATS parsing issues',
            actionItems: [
                'Use a single-column layout for better ATS compatibility',
                'Replace tables with simple text formatting',
                'Use line breaks instead of columns'
            ],
            expectedImpact: 10
        });
    }

    // Sort by priority and impact
    recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.expectedImpact - a.expectedImpact;
    });

    return recommendations.slice(0, 7); // Max 7 recommendations
}
