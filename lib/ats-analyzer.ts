import { ATSScore, Keyword, KeywordMatch, FormatIssue, Recommendation, AnalysisResult } from '@/types';
import { analyzeWithGemini } from './gemini';

/**
 * Calculate overall ATS score from component scores
 */
function calculateOverallScore(breakdown: ATSScore['breakdown']): number {
    const weights = {
        keywordMatch: 0.40,
        formatCompliance: 0.25,
        contentQuality: 0.20,
        optimization: 0.15,
    };

    return Math.round(
        breakdown.keywordMatch * weights.keywordMatch +
        breakdown.formatCompliance * weights.formatCompliance +
        breakdown.contentQuality * weights.contentQuality +
        breakdown.optimization * weights.optimization
    );
}

/**
 * Analyze resume against job description
 */
export async function analyzeResume(
    resumeText: string,
    jobDescription: string
): Promise<AnalysisResult> {
    try {
        // Get AI analysis from Gemini
        const aiAnalysis = await analyzeWithGemini(resumeText, jobDescription);

        // Process keywords from new structure
        const keywordAnalysis: KeywordMatch = {
            matched: (aiAnalysis.keywordAnalysis?.matched || []).map((k: any, idx: number) => ({
                ...k,
                id: `matched-${idx}`,
                frequency: k.frequency || 1,
                status: k.status || 'verified',
                context: k.context || 'Determined via Neural Analysis',
            })),
            missing: (aiAnalysis.keywordAnalysis?.missing || []).map((k: any, idx: number) => ({
                ...k,
                id: `missing-${idx}`,
                frequency: 0,
            })),
            partial: (aiAnalysis.keywordAnalysis?.partial || []).map((k: any, idx: number) => ({
                ...k,
                id: `partial-${idx}`,
                frequency: k.frequency || 1,
            })),
            extra: (aiAnalysis.keywordAnalysis?.extra || []).map((k: any, idx: number) => ({
                ...k,
                id: `extra-${idx}`,
                frequency: k.frequency || 1,
                importance: k.relevance || 'neutral',
            })),
        };

        // Process format issues
        const formatIssues: FormatIssue[] = aiAnalysis.formatIssues.map((issue: any) => ({
            ...issue,
        }));

        // Process recommendations
        const recommendations: Recommendation[] = aiAnalysis.recommendations.map((rec: any, idx: number) => ({
            id: `rec-${idx}`,
            ...rec,
        }));

        // Calculate scores
        const breakdown = {
            keywordMatch: aiAnalysis.scores.keywordMatch,
            formatCompliance: aiAnalysis.scores.formatCompliance,
            contentQuality: aiAnalysis.scores.contentQuality,
            optimization: aiAnalysis.scores.optimization,
        };

        const score: ATSScore = {
            overall: calculateOverallScore(breakdown),
            breakdown,
        };

        return {
            score,
            keywordAnalysis,
            formatIssues,
            recommendations,
            summary: aiAnalysis.summary,
            strengths: aiAnalysis.strengths,
            weaknesses: aiAnalysis.weaknesses,
        };
    } catch (error) {
        console.error('Error in ATS analysis:', error);
        throw new Error('Failed to analyze resume. Please try again.');
    }
}

// Non-AI utility functions moved to ats-utils.ts for client-side safety
