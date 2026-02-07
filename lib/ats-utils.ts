import { ATSScore } from '@/types';

/**
 * Get score category based on overall score
 */
export function getScoreCategory(score: number): {
    label: string;
    color: string;
    className: string;
} {
    if (score >= 80) {
        return {
            label: 'Excellent',
            color: 'green',
            className: 'score-excellent',
        };
    } else if (score >= 60) {
        return {
            label: 'Good',
            color: 'blue',
            className: 'score-good',
        };
    } else if (score >= 40) {
        return {
            label: 'Fair',
            color: 'amber',
            className: 'score-fair',
        };
    } else {
        return {
            label: 'Needs Improvement',
            color: 'red',
            className: 'score-poor',
        };
    }
}

/**
 * Generate improvement suggestions based on score breakdown
 */
export function generateImprovementSuggestions(score: ATSScore): string[] {
    const suggestions: string[] = [];

    if (score.breakdown.keywordMatch < 70) {
        suggestions.push('Add more relevant keywords from the job description to your resume');
    }

    if (score.breakdown.formatCompliance < 70) {
        suggestions.push('Simplify your resume format - avoid tables, images, and complex layouts');
    }

    if (score.breakdown.contentQuality < 70) {
        suggestions.push('Add more quantifiable achievements and use strong action verbs');
    }

    if (score.breakdown.optimization < 70) {
        suggestions.push('Ensure your resume is in a standard format (PDF preferred) and properly structured');
    }

    return suggestions;
}
