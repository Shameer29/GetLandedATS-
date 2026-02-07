import 'server-only';
import { z } from 'zod';

/**
 * Validation schemas for AI-generated Recruiter Tips
 * Ensures production quality with no hallucinations
 */

// Individual recruiter tip schema
export const RecruiterTipSchema = z.object({
    status: z.enum(['pass', 'warning', 'fail']),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    current: z.string().min(5, 'Current status must be descriptive'),
    recommendation: z.string().min(10, 'Recommendation must be actionable'),
    impact: z.enum(['high', 'medium', 'low'])
});

// Full recruiter tips response schema
export const RecruiterTipsSchema = z.object({
    jobLevelMatch: RecruiterTipSchema,
    measurableResults: RecruiterTipSchema,
    resumeLength: RecruiterTipSchema,
    resumeTone: RecruiterTipSchema,
    webPresence: RecruiterTipSchema,
    keywordOptimization: RecruiterTipSchema,
    atsParsability: RecruiterTipSchema
});

export type ValidatedRecruiterTip = z.infer<typeof RecruiterTipSchema>;
export type ValidatedRecruiterTips = z.infer<typeof RecruiterTipsSchema>;

/**
 * Validate AI-generated recruiter tips
 */
export function validateRecruiterTips(data: unknown): ValidatedRecruiterTips {
    try {
        return RecruiterTipsSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('[Recruiter Tips Validation] Failed:', error.issues);
            throw new Error(`Recruiter tips validation failed: ${error.issues.map((e: any) => e.message).join(', ')}`);
        }
        throw error;
    }
}

/**
 * Verify recruiter tip quality
 * Checks for hallucinations and unverified claims
 */
export function verifyRecruiterTipQuality(tip: ValidatedRecruiterTip): boolean {
    // Check for forbidden phrases
    const forbiddenPhrases = [
        'studies show',
        'research indicates',
        'recruiters prefer',
        '% of recruiters',
        'statistics show',
        'data suggests'
    ];

    const combinedText = `${tip.title} ${tip.current} ${tip.recommendation}`.toLowerCase();

    for (const phrase of forbiddenPhrases) {
        if (combinedText.includes(phrase)) {
            console.warn('[Recruiter Tips] Forbidden phrase detected:', phrase);
            return false;
        }
    }

    // Check for suspiciously specific percentages (likely hallucinated)
    const percentagePattern = /\d+(\.\d+)?%/g;
    const percentages = combinedText.match(percentagePattern);
    if (percentages && percentages.length > 2) {
        console.warn('[Recruiter Tips] Too many percentages detected (possible hallucination)');
        return false;
    }

    // Check for generic/placeholder content
    const genericPhrases = ['lorem ipsum', 'example', 'placeholder', 'TODO'];
    for (const phrase of genericPhrases) {
        if (combinedText.includes(phrase)) {
            console.warn('[Recruiter Tips] Generic placeholder detected:', phrase);
            return false;
        }
    }

    return true;
}
