import 'server-only';
import { z } from 'zod';

/**
 * AI Output Validation
 * Ensures all AI-generated content meets production quality standards
 * No hallucinations, no unverified claims, no malformed data
 */

// Schema for OptimizeSuggestion - matches types/universal-ats.ts
export const OptimizeSuggestionSchema = z.object({
    type: z.enum([
        'bullet_rewrite',
        'add_keyword',
        'add_metric',
        'remove_weak_phrase',
        'rewrite_bullet',
        'quantify',
        'reorder',
        'remove',
        'general'
    ]),
    original: z.string(),
    suggested: z.string(),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    impact: z.number().min(0).max(20, 'Impact must be 0-20')
});

export const OptimizeSuggestionsArraySchema = z.array(OptimizeSuggestionSchema).max(5, 'Maximum 5 suggestions');

export type ValidatedOptimizeSuggestion = z.infer<typeof OptimizeSuggestionSchema>;

/**
 * Validate AI-generated optimize suggestions
 * Throws detailed error if validation fails
 */
export function validateOptimizeSuggestions(data: unknown): ValidatedOptimizeSuggestion[] {
    try {
        return OptimizeSuggestionsArraySchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('[AI Validation] Schema validation failed:', error.issues);
            throw new Error(`AI output validation failed: ${error.issues.map((e: any) => e.message).join(', ')}`);
        }
        throw error;
    }
}

/**
 * Clean AI response text before parsing
 * Removes markdown code blocks and fixes common JSON issues
 */
export function cleanAIResponse(text: string): string {
    let cleaned = text.trim();

    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
    }

    return cleaned;
}

/**
 * Fix common JSON formatting issues in AI responses
 * Handles unescaped quotes and newlines
 */
export function fixMalformedJSON(text: string): string {
    return text
        // Fix unescaped newlines in strings
        .replace(/: "([^"]*\n[^"]*)"/g, (match, content) => {
            return `: "${content.replace(/\n/g, '\\n')}"`;
        })
        // Fix trailing commas before closing braces/brackets
        .replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Safe JSON parse with automatic fixing and validation
 * Returns validated data or throws descriptive error
 */
export function safeParseAndValidate<T>(
    text: string,
    validator: (data: unknown) => T,
    context: string
): T {
    // Step 1: Clean the response
    let cleaned = cleanAIResponse(text);

    // Step 2: Try to parse
    try {
        const parsed = JSON.parse(cleaned);
        return validator(parsed);
    } catch (firstError: any) {
        console.warn(`[AI Validation] First parse attempt failed for ${context}:`, firstError.message);

        // Step 3: Try to fix common issues
        try {
            const fixed = fixMalformedJSON(cleaned);
            const parsed = JSON.parse(fixed);
            console.log(`✓ [AI Validation] JSON fixed successfully for ${context}`);
            return validator(parsed);
        } catch (secondError: any) {
            console.error(`[AI Validation] Failed to parse ${context} after fixing:`, secondError.message);
            console.error('Problematic text (first 500 chars):', cleaned.substring(0, 500));
            throw new Error(`Failed to parse AI response for ${context}: ${firstError.message}`);
        }
    }
}

/**
 * Create a safe error suggestion when AI fails
 */
export function createErrorSuggestion(errorMessage: string): ValidatedOptimizeSuggestion {
    return {
        type: 'general', // Use 'general' instead of 'error' to match OptimizeSuggestion type
        original: '',
        suggested: '',
        reason: errorMessage || 'Unable to generate AI suggestions at this time. Please try again.',
        impact: 0
    };
}

/**
 * Verify suggestion quality
 * Checks for common AI hallucination patterns
 */
export function verifySuggestionQuality(suggestion: ValidatedOptimizeSuggestion): boolean {
    // Check for suspiciously generic suggestions
    const genericPhrases = [
        'lorem ipsum',
        'example text',
        'placeholder',
        'TODO',
        'insert here'
    ];

    const suggestionLower = suggestion.suggested.toLowerCase();
    if (genericPhrases.some(phrase => suggestionLower.includes(phrase))) {
        console.warn('[AI Validation] Generic/placeholder text detected:', suggestion.suggested);
        return false;
    }

    // Check for reasonable length (skip for general type which may be error messages)
    if (suggestion.suggested.length < 10 && suggestion.type !== 'general') {
        console.warn('[AI Validation] Suggestion too short:', suggestion.suggested);
        return false;
    }

    // Check for fabricated metrics (suspiciously round numbers)
    if (suggestion.type === 'bullet_rewrite') {
        const suspiciousPatterns = [
            /increased.*100%/i,
            /reduced.*100%/i,
            /saved.*\$1,000,000/i
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(suggestion.suggested))) {
            console.warn('[AI Validation] Suspiciously perfect metrics detected:', suggestion.suggested);
            return false;
        }
    }

    return true;
}
