import 'server-only';
import { getGeminiModel } from './gemini';
import type {
    JDAnalysis,
    ResumeAnalysis,
    MatchResult,
    SkillMatch,
} from '@/types/universal-ats';

/**
 * AI-Powered Smart Matcher
 * Uses Gemini to dynamically compare JD requirements with Resume
 * NO HARDCODED SYNONYMS - AI understands skill equivalences
 */
export async function matchJDToResumeAI(
    jdAnalysis: JDAnalysis,
    resumeAnalysis: ResumeAnalysis,
    resumeText: string
): Promise<MatchResult> {
    // Use AI to match skills dynamically
    const skillsMatch = await matchSkillsWithAI(jdAnalysis, resumeText);

    // Match experience (simple comparison)
    const experienceMatch = matchExperience(jdAnalysis, resumeAnalysis);

    // Match education (simple comparison)
    const educationMatch = matchEducation(jdAnalysis, resumeAnalysis);

    // Match certifications with AI
    const certificationMatch = await matchCertificationsWithAI(jdAnalysis, resumeText);

    // Match job level
    const jobLevelMatch = matchJobLevel(jdAnalysis, resumeAnalysis);

    // Calculate scores
    const scores = calculateScores(skillsMatch, experienceMatch, educationMatch, resumeAnalysis.contentQuality);

    return {
        overallScore: scores.overall,
        breakdown: scores.breakdown,
        skills: skillsMatch,
        experienceMatch,
        educationMatch,
        certificationMatch,
        jobLevelMatch
    };
}

/**
 * AI-Powered Skill Matching
 * Uses Gemini to understand skill equivalences dynamically
 */
async function matchSkillsWithAI(jdAnalysis: JDAnalysis, resumeText: string): Promise<{
    matched: SkillMatch[];
    missing: SkillMatch[];
    extra: SkillMatch[];
}> {
    const model = getGeminiModel();

    // Build skill list from JD
    const allJDSkills = [
        ...jdAnalysis.hardSkills.map(s => ({ name: s.name, importance: s.importance, type: 'hard' as const, frequency: s.frequency })),
        ...jdAnalysis.softSkills.map(s => ({ name: s.name, importance: s.importance, type: 'soft' as const, frequency: s.frequency }))
    ];

    if (allJDSkills.length === 0) {
        return { matched: [], missing: [], extra: [] };
    }

    const prompt = `You are an ULTRA-STRICT Applicant Tracking System (ATS) scanner. Your job is to perform EXACT, evidence-based keyword matching between job requirements and a resume.

STRICT MATCHING RULES (ZERO TOLERANCE):
1. EXPLICIT ONLY: A skill is FOUND only if the resume contains:
   - The EXACT skill name, OR
   - A UNIVERSALLY ACCEPTED abbreviation or variation of that specific skill
2. NO ASSUMPTIONS: Do NOT infer or assume skills. A job title does NOT imply specific skills. Experience duration does NOT imply specific skills.
3. MISSING = NOT FOUND: If the skill is not explicitly written in the resume, mark it as:
   - found: false
   - matchedAs: null
   - context: null
   - frequency: 0
4. PROOF REQUIRED: For every found: true, you MUST provide:
   - matchedAs: The EXACT substring from the resume (copy-paste the text)
   - context: The sentence containing this substring
   - frequency: Exact count of occurrences in the entire resume
5. COUNT ACCURATELY: Scan the ENTIRE resume and count EVERY occurrence of the skill term.

RESUME TEXT:
---
${resumeText}
---

REQUIRED SKILLS TO VERIFY (from Job Description):
${allJDSkills.map((s, i) => `${i + 1}. "${s.name}" [${s.importance.toUpperCase()}] (${s.type})`).join('\n')}

FOR EACH SKILL ABOVE, DETERMINE:
- Is the EXACT skill name (or its standard variation) explicitly written in the resume?
- If YES: found=true, matchedAs=exact text, context=sentence, frequency=count
- If NO: found=false, matchedAs=null, context=null, frequency=0

Return a JSON object:
{
  "matches": [
    {
      "skill": "exact skill name from list above",
      "found": true | false,
      "matchedAs": "exact text from resume" | null,
      "context": "surrounding sentence from resume" | null,
      "frequency": number (0 if not found),
      "confidence": "high" | "medium" | "low"
    }
  ],
  "extraSkills": ["skills found in resume but NOT in the required list"]
}

ANTI-HALLUCINATION CHECK:
- If a skill is NOT in the resume, it MUST be marked found: false.
- Do NOT guess. Do NOT assume. Do NOT infer.
- When in doubt, mark as MISSING (found: false).

Execute strict matching now.`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(cleanJson) as {
            matches: Array<{
                skill: string;
                found: boolean;
                matchedAs: string | null;
                context: string | null;
                frequency: number;
                confidence: string;
            }>;
            extraSkills: string[];
        };

        const matched: SkillMatch[] = [];
        const missing: SkillMatch[] = [];
        const extra: SkillMatch[] = [];

        // Process AI results
        for (const match of aiResult.matches) {
            const jdSkill = allJDSkills.find(s =>
                s.name.toLowerCase() === match.skill.toLowerCase()
            );

            const skillMatch: SkillMatch = {
                skill: match.skill,
                importance: jdSkill?.importance || 'preferred',
                foundInResume: match.found,
                jdFrequency: jdSkill?.frequency || 1,
                resumeFrequency: match.frequency || (match.found ? 1 : 0),
                resumeContext: match.context || undefined,
                matchedAs: match.matchedAs || undefined,
                matchType: match.found ? (match.confidence === 'high' ? 'exact' : 'variant') : undefined
            };

            if (match.found) {
                matched.push(skillMatch);
            } else {
                missing.push(skillMatch);
            }
        }

        // Add extra skills
        for (const extraSkill of aiResult.extraSkills || []) {
            extra.push({
                skill: extraSkill,
                importance: 'bonus',
                foundInResume: true,
                jdFrequency: 0
            });
        }

        console.log(`AI Matching: ${matched.length} matched, ${missing.length} missing, ${extra.length} extra`);

        return { matched, missing, extra };

    } catch (error) {
        console.error('AI skill matching error:', error);
        // Fallback to basic text matching
        return fallbackTextMatch(allJDSkills, resumeText);
    }
}

/**
 * Fallback text matching if AI fails
 */
function fallbackTextMatch(
    jdSkills: Array<{ name: string; importance: string; type: string; frequency?: number }>,
    resumeText: string
): { matched: SkillMatch[]; missing: SkillMatch[]; extra: SkillMatch[] } {
    const resumeLower = resumeText.toLowerCase();
    const matched: SkillMatch[] = [];
    const missing: SkillMatch[] = [];

    for (const skill of jdSkills) {
        const skillLower = skill.name.toLowerCase();
        const found = resumeLower.includes(skillLower);

        const skillMatch: SkillMatch = {
            skill: skill.name,
            importance: skill.importance as 'required' | 'preferred' | 'bonus',
            foundInResume: found,
            jdFrequency: 1,
            matchType: found ? 'text_search' : undefined
        };

        if (found) {
            matched.push(skillMatch);
        } else {
            missing.push(skillMatch);
        }
    }

    return { matched, missing, extra: [] };
}

/**
 * AI-Powered Certification Matching
 */
async function matchCertificationsWithAI(jdAnalysis: JDAnalysis, resumeText: string): Promise<{
    matched: string[];
    missing: string[];
}> {
    if (jdAnalysis.certifications.length === 0) {
        return { matched: [], missing: [] };
    }

    const model = getGeminiModel();

    const prompt = `Check which certifications from the job requirements are in this resume.

RESUME:
${resumeText}

REQUIRED CERTIFICATIONS:
${jdAnalysis.certifications.join('\n')}

Return JSON: { "matched": ["found certs"], "missing": ["not found certs"] }`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { matched: [], missing: jdAnalysis.certifications };
        }

        return JSON.parse(jsonMatch[0]);
    } catch {
        return { matched: [], missing: jdAnalysis.certifications };
    }
}

/**
 * Match experience requirements
 */
function matchExperience(jdAnalysis: JDAnalysis, resumeAnalysis: ResumeAnalysis): {
    meetsRequirement: boolean;
    candidateYears: number;
    requiredYears: number;
    gap?: string;
} {
    const candidateYears = resumeAnalysis.totalYearsOfExperience;
    const requiredYears = jdAnalysis.experience.minimumYears || 0;

    const meetsRequirement = candidateYears >= requiredYears;

    return {
        meetsRequirement,
        candidateYears,
        requiredYears,
        gap: !meetsRequirement
            ? `Need ${requiredYears - candidateYears} more years of experience`
            : undefined
    };
}

/**
 * Match education requirements
 */
function matchEducation(jdAnalysis: JDAnalysis, resumeAnalysis: ResumeAnalysis): {
    meetsRequirement: boolean;
    candidateDegree: string;
    requiredDegree: string;
    fieldMatch: boolean;
} {
    const degreeHierarchy: Record<string, number> = {
        'high_school': 1,
        'associate': 2,
        'bachelor': 3,
        'master': 4,
        'phd': 5,
        'any': 0,
        'not_specified': 0,
    };

    const candidateDegree = resumeAnalysis.education?.[0]?.degree || 'not_specified';
    const requiredDegree = jdAnalysis.education.degree || 'not_specified';

    const candidateLevel = degreeHierarchy[candidateDegree.toLowerCase()] || 0;
    const requiredLevel = degreeHierarchy[requiredDegree] || 0;

    const meetsRequirement = !jdAnalysis.education.isRequired || candidateLevel >= requiredLevel;

    // Check field match
    let fieldMatch = true;
    if (jdAnalysis.education.field && resumeAnalysis.education?.length) {
        const requiredFieldLower = jdAnalysis.education.field.toLowerCase();
        fieldMatch = resumeAnalysis.education.some(e =>
            e.field?.toLowerCase().includes(requiredFieldLower) ||
            requiredFieldLower.includes(e.field?.toLowerCase() || '')
        );
    }

    return {
        meetsRequirement,
        candidateDegree,
        requiredDegree,
        fieldMatch
    };
}

/**
 * Match job level
 */
function matchJobLevel(jdAnalysis: JDAnalysis, resumeAnalysis: ResumeAnalysis): {
    matches: boolean;
    candidateLevel: string;
    requiredLevel: string;
    recommendation?: string;
} {
    const jdLevel = jdAnalysis.jobLevel || 'unknown';
    // Derive candidate level from experience
    const candidateYears = resumeAnalysis.totalYearsOfExperience;
    let candidateLevel = 'entry';
    if (candidateYears >= 10) candidateLevel = 'lead';
    else if (candidateYears >= 5) candidateLevel = 'senior';
    else if (candidateYears >= 2) candidateLevel = 'mid';

    const levelOrder = ['entry', 'mid', 'senior', 'lead', 'manager', 'director', 'executive'];
    const jdIndex = levelOrder.indexOf(jdLevel);
    const candidateIndex = levelOrder.indexOf(candidateLevel);

    // Match if candidate is at or above required level (within 1 level tolerance)
    const matches = jdLevel === 'unknown' ||
        (candidateIndex >= jdIndex - 1);

    return {
        matches,
        candidateLevel,
        requiredLevel: jdLevel,
        recommendation: !matches
            ? `This position requires ${jdLevel} level experience. Consider roles at ${candidateLevel} level.`
            : undefined
    };
}

/**
 * Calculate overall scores
 */
function calculateScores(
    skillsMatch: { matched: SkillMatch[]; missing: SkillMatch[] },
    experienceMatch: { meetsRequirement: boolean; candidateYears: number; requiredYears: number },
    educationMatch: { meetsRequirement: boolean },
    contentQuality: ResumeAnalysis['contentQuality']
) {
    // Skills score (weighted by importance)
    let skillsScore = 0;
    let totalWeight = 0;

    const importanceWeight: Record<string, number> = {
        'required': 3,
        'preferred': 2,
        'bonus': 1
    };

    [...skillsMatch.matched, ...skillsMatch.missing].forEach(skill => {
        const weight = importanceWeight[skill.importance] || 1;
        totalWeight += weight;
        if (skill.foundInResume) {
            skillsScore += weight;
        }
    });

    const skillsPercentage = totalWeight > 0 ? Math.round((skillsScore / totalWeight) * 100) : 100;

    // Experience score
    let experienceScore = 100;
    if (experienceMatch.requiredYears > 0) {
        const ratio = experienceMatch.candidateYears / experienceMatch.requiredYears;
        experienceScore = Math.min(100, Math.round(ratio * 100));
    }

    // Education score
    const educationScore = educationMatch.meetsRequirement ? 100 : 50;

    // Content quality score - use available metrics
    const qualityScore = Math.min(100, Math.round(
        (contentQuality.averageBulletScore || 0)
    ));

    // Overall score (weighted average)
    const overall = Math.round(
        (skillsPercentage * 0.50) +
        (experienceScore * 0.25) +
        (educationScore * 0.15) +
        (qualityScore * 0.10)
    );

    return {
        overall,
        breakdown: {
            keywordMatch: skillsPercentage,
            experienceMatch: experienceScore,
            educationMatch: educationScore,
            skillsMatch: skillsPercentage,
            contentQuality: qualityScore
        }
    };
}
