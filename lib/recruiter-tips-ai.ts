import 'server-only';
import { getGeminiModel } from './gemini';
import {
    safeParseAndValidate,
    cleanAIResponse,
    fixMalformedJSON
} from './ai-validation';
import { validateRecruiterTips, verifyRecruiterTipQuality, type ValidatedRecruiterTips } from './recruiter-tips-validation';
import type {
    RecruiterTips,
    ResumeAnalysis,
    JDAnalysis,
    MatchResult
} from '@/types/universal-ats';

/**
 * Generate AI-powered Recruiter Tips with strict anti-hallucination controls
 * Falls back to rule-based tips if AI fails
 */
export async function generateAIRecruiterTips(
    resumeAnalysis: ResumeAnalysis,
    jdAnalysis: JDAnalysis,
    matchResult: MatchResult
): Promise<RecruiterTips> {
    const model = getGeminiModel();

    // Prepare data for AI
    const resumeStats = {
        wordCount: resumeAnalysis.contentQuality.wordCount,
        totalBullets: resumeAnalysis.contentQuality.totalBullets,
        bulletsWithMetrics: resumeAnalysis.contentQuality.bulletsWithMetrics,
        bulletsWithWeakPhrases: resumeAnalysis.contentQuality.bulletsWithWeakPhrases,
        actionVerbCount: resumeAnalysis.contentQuality.actionVerbCount,
        hasLinkedIn: resumeAnalysis.formatting.hasLinkedIn,
        hasEmail: resumeAnalysis.formatting.hasEmail,
        hasPhone: resumeAnalysis.formatting.hasPhone,
        hasTablesOrColumns: resumeAnalysis.formatting.hasTablesOrColumns,
        isScannedPdf: resumeAnalysis.formatting.isScannedPdf,
        missingSections: resumeAnalysis.formatting.missingSections
    };

    const matchStats = {
        candidateLevel: matchResult.jobLevelMatch.candidateLevel,
        requiredLevel: matchResult.jobLevelMatch.requiredLevel,
        levelMatches: matchResult.jobLevelMatch.matches,
        skillsMatched: matchResult.skills.matched.length,
        skillsMissing: matchResult.skills.missing.length,
        requiredSkillsMissing: matchResult.skills.missing.filter(s => s.importance === 'required').length
    };

    const prompt = `You are the AI responsible for generating Recruiter Tips in GetLanded, a production-grade ATS Resume Analyzer used by 10,000+ students for real job applications.

Your role is to provide accurate, conservative, and actionable recruiter-style feedback based ONLY on the analyzed resume and job description.

🔒 ABSOLUTE RULES (NON-NEGOTIABLE):
1. NO HALLUCINATIONS - Only use data provided below
2. NO INVENTED STATISTICS - Do not cite percentages like "87% of recruiters"
3. NO ASSUMPTIONS - If data is missing, state "Not found" or "Unclear"
4. NO FABRICATED METRICS - Only reference actual numbers from the data
5. NO MARKETING LANGUAGE - Be professional and factual
6. If information is not present, mark it as "Missing" or "Unclear"

📊 RESUME DATA:
- Word Count: ${resumeStats.wordCount}
- Total Bullets: ${resumeStats.totalBullets}
- Bullets with Metrics: ${resumeStats.bulletsWithMetrics}
- Bullets with Weak Phrases: ${resumeStats.bulletsWithWeakPhrases}
- Action Verb Count: ${resumeStats.actionVerbCount}
- Has LinkedIn: ${resumeStats.hasLinkedIn}
- Has Email: ${resumeStats.hasEmail}
- Has Phone: ${resumeStats.hasPhone}
- Has Tables/Columns: ${resumeStats.hasTablesOrColumns}
- Is Scanned PDF: ${resumeStats.isScannedPdf}
- Missing Sections: ${resumeStats.missingSections.join(', ') || 'None'}

📊 MATCH DATA:
- Candidate Level: ${matchStats.candidateLevel}
- Required Level: ${matchStats.requiredLevel}
- Level Matches: ${matchStats.levelMatches}
- Skills Matched: ${matchStats.skillsMatched}
- Skills Missing: ${matchStats.skillsMissing}
- Required Skills Missing: ${matchStats.requiredSkillsMissing}

📌 MANDATORY: Generate feedback for ALL 7 sections. Do not skip any.

🧠 SECTION RULES:

1. JOB LEVEL MATCH:
   - Compare candidate level to required level
   - Do not infer beyond stated data
   - If unclear → "Level alignment cannot be confidently determined"

2. MEASURABLE RESULTS:
   - Use exact numbers: ${resumeStats.bulletsWithMetrics} of ${resumeStats.totalBullets} bullets
   - Calculate percentage: ${resumeStats.totalBullets > 0 ? Math.round((resumeStats.bulletsWithMetrics / resumeStats.totalBullets) * 100) : 0}%
   - Do not invent metrics

3. RESUME LENGTH:
   - Use word count: ${resumeStats.wordCount}
   - Optimal range: 400-800 words
   - Status: ${resumeStats.wordCount < 400 ? 'Too short' : resumeStats.wordCount > 800 ? 'Too long' : 'Optimal'}

4. PROFESSIONAL TONE:
   - Weak phrases: ${resumeStats.bulletsWithWeakPhrases} of ${resumeStats.totalBullets}
   - Action verbs: ${resumeStats.actionVerbCount} of ${resumeStats.totalBullets}
   - Only assess, do not rewrite

5. WEB PRESENCE:
   - LinkedIn: ${resumeStats.hasLinkedIn ? 'Found' : 'Not found'}
   - Email: ${resumeStats.hasEmail ? 'Found' : 'Not found'}
   - Phone: ${resumeStats.hasPhone ? 'Found' : 'Not found'}
   - Only evaluate what is present

6. KEYWORD OPTIMIZATION:
   - Skills matched: ${matchStats.skillsMatched}
   - Skills missing: ${matchStats.skillsMissing}
   - Required skills missing: ${matchStats.requiredSkillsMissing}
   - Do not suggest unrelated keywords

7. ATS PARSABILITY:
   - Tables/Columns: ${resumeStats.hasTablesOrColumns ? 'Detected' : 'Not detected'}
   - Scanned PDF: ${resumeStats.isScannedPdf ? 'Yes' : 'No'}
   - Missing sections: ${resumeStats.missingSections.length > 0 ? resumeStats.missingSections.join(', ') : 'None'}
   - If uncertain, state limitation

🧾 OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:

{
  "jobLevelMatch": {
    "status": "pass" | "warning" | "fail",
    "title": "Job Level Match",
    "current": "Exact description using provided data",
    "recommendation": "Actionable advice without inventing content",
    "impact": "high" | "medium" | "low"
  },
  "measurableResults": { ... same structure ... },
  "resumeLength": { ... same structure ... },
  "resumeTone": { ... same structure ... },
  "webPresence": { ... same structure ... },
  "keywordOptimization": { ... same structure ... },
  "atsParsability": { ... same structure ... }
}

🚫 FORBIDDEN:
❌ "Recruiters prefer..." without context
❌ "Studies show..." without sources
❌ Percentages not directly calculated from data
❌ Generic career advice
❌ Motivational language

🎯 TONE: Professional, Neutral, Clear, Supportive, Non-judgmental. No fluff. No hype.

Return ONLY the JSON object, nothing else.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse and validate
        const validated = safeParseAndValidate(
            text,
            validateRecruiterTips,
            'recruiter-tips'
        );

        // Quality check each tip
        const tips = Object.values(validated);
        const allQualityPassed = tips.every(tip => verifyRecruiterTipQuality(tip));

        if (!allQualityPassed) {
            console.warn('[Recruiter Tips] Quality check failed, using fallback');
            throw new Error('Quality validation failed');
        }

        console.log('✓ [Recruiter Tips] AI-generated tips validated successfully');
        return validated as RecruiterTips;

    } catch (error: any) {
        console.error('[Recruiter Tips] AI generation failed:', error.message);
        console.log('[Recruiter Tips] Falling back to rule-based tips');

        // Fallback to rule-based tips
        const { generateRecruiterTips } = await import('./recruiter-tips');
        return generateRecruiterTips(resumeAnalysis, jdAnalysis, matchResult);
    }
}
