import 'server-only';
import { getGeminiModel } from './gemini';

import { verifySkillMatches, verifyMatch, deduplicateSkills } from './matcher';
import { SkillAnalysis } from '@/types';

/**
 * ATS Engine - Universal, Unbiased Analysis
 * Works for ANY job, ANY industry, ANY resume type, ANY location
 * Zero hardcoded examples - pure dynamic analysis
 */

export interface ATSAnalysisResult {
  matchRate: MatchRateBreakdown;
  hardSkills: SkillAnalysis[];
  softSkills: SkillAnalysis[];
  searchability: SearchabilityAnalysis;
  recruiterTips: RecruiterTip[];
  formatting: FormattingAnalysis;
  resumeStructure: ResumeStructure;
  aiRewrites: AIRewrites;
  sideBySide: SideBySideData;
}

export interface MatchRateBreakdown {
  overall: number;
  hardSkills: number;
  softSkills: number;
  searchability: number;
  formatting: number;
}


export interface SearchabilityAnalysis {
  score: number;

  // Contact Info Parsing
  contactParsing: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasName: boolean;
    inParseableLocation: boolean;
  };

  // Section Headings Check
  sectionHeadings: {
    usesStandardHeadings: boolean;
    detectedHeadings: string[];
    nonStandardHeadings: string[];
  };

  // Job Title Match
  jobTitleMatch: {
    jdTitle: string;
    foundInResume: boolean;
    exactMatch: boolean;
    variations: string[];
  };

  // Date Format Check
  dateFormat: {
    isConsistent: boolean;
    isATSFriendly: boolean;
    issues: string[];
  };

  // Formatting/Parsing Risks
  formattingRisks: {
    hasTables: boolean;
    hasColumns: boolean;
    hasFancyBullets: boolean;
    hasImages: boolean;
    issues: string[];
  };

  // JobScan Parity Checks
  contentChecks: {
    hasEmptySections: boolean;
    emptySectionsList: string[];
    educationMatch: {
      match: boolean;
      requiredLevel: string;
      foundLevel: string;
    };
    locationPresent: boolean;
    filenameSafe: boolean;
    hasSummary: boolean;
  };

  // Overall checklist items
  checks: SearchabilityCheck[];
}

export interface SearchabilityCheck {
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
  fix?: string;
}

export interface RecruiterTip {
  category: string;
  tip: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
  fix?: string;
}

export interface FormattingAnalysis {
  score: number;
  hasProperSections: boolean;
  hasCleanFormat: boolean;
  hasProperLength: boolean;
  issues: string[];
}

export interface ResumeStructure {
  hasContact: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasSummary: boolean;
  summaryQuality: 'good' | 'weak' | 'missing';
  hasExperience: boolean;
  experienceCount: number;
  hasEducation: boolean;
  hasSkillsSection: boolean;
  detectedSections: string[];
}

export interface AIRewrites {
  summary: string;
  bullets: BulletRewrite[];
  skillSentences: SkillSentence[];
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
  improvement: string;
}

export interface SkillSentence {
  skill: string;
  sentence: string;
}

export interface SideBySideData {
  resumeKeywords: string[];
  jdKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

// Optional metadata for accurate table/column detection
export interface ATSMetadata {
  hasTables: boolean;
  hasColumns: boolean;
  hasImages: boolean;
}

/**
 * Main ATS Analysis - Single-Pass Architecture
 * Cost-Optimized: 1 Call per Analysis
 * Stability-Optimized: Uses "Anchor Fields" to force deterministic extraction before matching
 */
export async function runATSAnalysis(
  resumeText: string,
  jobDescription: string,
  metadata?: ATSMetadata,
  fileName?: string
): Promise<ATSAnalysisResult> {
  // Cache disabled for absolute freshness

  const model = getGeminiModel();

  // UNIVERSAL SUPER PROMPT - Single Pass with Anchor
  const prompt = `Analyze the following resume against the job description.
  
=== RESUME METADATA ===
Filename: ${fileName || 'Unknown'}
${metadata ? `Structure Risks: Tables=${metadata.hasTables}, Columns=${metadata.hasColumns}, Images=${metadata.hasImages}` : ''}

=== JOB DESCRIPTION ===
${jobDescription}

=== RESUME TEXT ===
${resumeText}

=== INSTRUCTIONS ===

PHASE 1: JD ANALYSIS (The Anchor)
- First, carefully read the ENTIRE JOB DESCRIPTION (Intro, Responsibilities, Requirements, Benefits, Company Info).
- Extract ALL hard skills and soft skills found ANYWHERE in the text.
- CRITICAL: Do NOT limit extraction to "Requirements" or "Skills" sections. Skills are often hidden in "About the Role" or "What You'll Do".
- CAPTURE EVERYTHING: Do not filter out "basic" or "minor" skills. If it is mentioned, it is a target.
- This extraction will be your "Ground Truth" for the matching phase.
- You MUST populate the '_anchor_jd_hard_skills' and '_anchor_jd_soft_skills' fields first.

⚠️ CRITICAL SOFT SKILLS EXTRACTION RULES:
1. ONLY extract soft skills that are EXPLICITLY MENTIONED in the JD text
2. DO NOT use generic soft skills lists (e.g., "communication", "teamwork", "leadership") UNLESS they appear in the JD
3. Extract the EXACT PHRASES as written in the JD (e.g., "strategic vision", "driving development", "fostering innovation")
4. DO NOT infer or assume soft skills that aren't explicitly stated
5. If the JD says "strategic vision" - extract "strategic vision", NOT just "vision"
6. If the JD says "leading cross-functional teams" - extract the full phrase, NOT just "leadership" or "teams"
7. Soft skills are often multi-word phrases describing behaviors, approaches, or qualities
8. Look for phrases with action words + context (e.g., "managing people", "driving strategy", "fostering culture")

EXAMPLES OF CORRECT EXTRACTION:
- JD text: "...driving the product strategy..." → Extract: "driving the product strategy"
- JD text: "...strategic vision for the product..." → Extract: "strategic vision"
- JD text: "...leading cross-functional teams..." → Extract: "leading cross-functional teams"

EXAMPLES OF INCORRECT EXTRACTION (DO NOT DO THIS):
- JD text: "...product development..." → DO NOT extract "development" as a soft skill (it's context, not a skill)
- JD text: "...strategic vision..." → DO NOT extract just "vision" (missing "strategic")
- JD text: "...experience with teams..." → DO NOT extract "teamwork" (not explicitly stated)

PHASE 2: MATCHING
- Compare the RESUME against the skills you just extracted in Phase 1.
- NO HALLUCINATIONS: If it's not in the resume text, it is MISSING.
- NO SYNONYMS: Do not count synonyms or related terms as matches.
- NO PARTIALS: Do not match partial substrings.

CRITICAL SOFT SKILLS MATCHING RULES:
1. Soft skills are PHRASES, not single words. Match the FULL PHRASE or clear semantic equivalent.
2. DO NOT match if only a word from the phrase appears. Examples:
   - JD wants "driving development" → Resume has "development" → NOT A MATCH
   - JD wants "strategic vision" → Resume has "vision" → NOT A MATCH  
   - JD wants "leading cross-functional teams" → Resume has "teams" → NOT A MATCH
   - JD wants "product strategy" → Resume has "strategy" → NOT A MATCH
3. ONLY mark as matched if:
   - The EXACT phrase appears in resume, OR
   - A clear semantic equivalent appears (e.g., "led cross-functional teams" = "leading cross-functional teams")
   - The FULL CONCEPT is demonstrated, not just a keyword
4. When in doubt, mark as MISSING. Better to under-match than over-match.
5. For multi-word soft skills, ALL significant words must be present in close proximity.

HARD SKILLS MATCHING (Different Rules):
- Hard skills are often single technical terms (e.g., "Python", "AWS", "Docker")
- These CAN be matched as standalone words
- Still no partial matches (e.g., "Java" does not match "JavaScript")

PHASE 3: SCORING & REPORTING
- Calculate scores based on the match rate.
- Generate searchability tips.
- Generate formatting feedback.

⚠️ ANTI-HALLUCINATION RULES:
1. NEVER mark a keyword as "matched" unless you see it LITERALLY in the resume text.
2. If you CANNOT find the word, it is MISSING.
3. Be LITERAL. Be STRICT. No assumptions.

SOFT SKILLS VALIDATION EXAMPLES:
✅ CORRECT MATCHES:
- JD: "strategic vision" + Resume: "developed strategic vision for product roadmap" → MATCH
- JD: "leading teams" + Resume: "led cross-functional teams of 10 engineers" → MATCH (semantic equivalent)
- JD: "collaboration" + Resume: "collaborative team member" → MATCH (same root concept)

❌ INCORRECT MATCHES (DO NOT DO THIS):
- JD: "strategic vision" + Resume: "vision statement" → NO MATCH (missing "strategic")
- JD: "driving development" + Resume: "software development experience" → NO MATCH (missing "driving")
- JD: "product strategy" + Resume: "strategy" → NO MATCH (missing "product" context)
- JD: "managing people" + Resume: "people skills" → NO MATCH (different concepts)
- JD: "fostering innovation" + Resume: "innovation" → NO MATCH (missing "fostering" action)

STEP 4: SCORING (Objective Formula)
- hardSkills score = (matched hard skills / total hard skills in JD) * 100
- softSkills score = (matched soft skills / total soft skills in JD) * 100
- searchability = (keywords found in resume / important keywords in JD) * 100
- formatting = based on structure completeness
- overall = weighted average considering all factors

Return this exact JSON structure:

{
  "_anchor_jd_hard_skills": ["List ALL hard skills found in JD here first"],
  "_anchor_jd_soft_skills": ["List ALL soft skills found in JD here first"],
  "matchRate": {
    "overall": <calculated percentage>,
    "hardSkills": <percentage>,
    "softSkills": <percentage>,
    "searchability": <percentage>,
    "formatting": <percentage>
  },
  
  "hardSkills": [
    {
      "skill": "<exact skill text from JD - do not filter out 'minor' skills>",
      "category": "<category>",
      "required": <true only if JD explicitly says required, otherwise false>,
      "jdCount": <occurrences in JD>,
      "resumeCount": <occurrences in resume, 0 if not found>,
      "matched": <true if found in resume>,
      "context": "<quote from resume where found, or null>"
    }
  ],
  "softSkills": [
    {
      "skill": "<exact soft skill text from JD - capture ALL traits>",
      "category": "soft",
      "required": <true/false>,
      "jdCount": <count>,
      "resumeCount": <count>,
      "matched": <true/false>,
      "context": "<evidence or null>"
    }
  ],
  "searchability": {
    "score": <0-100 based on checks passed>,
    "contactParsing": {
      "hasEmail": <true if email found in resume>,
      "hasPhone": <true if phone found>,
      "hasLinkedIn": <true if LinkedIn URL found>,
      "hasName": <true if name clearly identifiable>,
      "inParseableLocation": <true if contact info is in main body, false if only in headers/footers>
    },
    "sectionHeadings": {
      "usesStandardHeadings": <true if uses standard ATS headings>,
    "score": 0,
    "contactParsing": { "hasEmail": false, "hasPhone": false, "hasLinkedIn": false, "hasName": false, "inParseableLocation": false },
    "sectionHeadings": {
      "usesStandardHeadings": <true if uses standard ATS headings>,
      "detectedHeadings": ["<list of section headings found>"],
      "nonStandardHeadings": ["<any unusual/creative headings that ATS may not recognize>"]
    },
    "jobTitleMatch": {
      "jdTitle": "<exact job title from JD>",
      "foundInResume": <true if title or close variation found in resume>,
      "exactMatch": <true if exactly matches>,
      "variations": ["<similar titles found in resume>"]
    },
    "dateFormat": {
      "isConsistent": <true if all dates use same format>,
      "isATSFriendly": <true if dates are in Month/Year or MM/YYYY format>,
      "issues": ["<any date format problems>"]
    },
    "formattingRisks": {
      "hasTables": <true if tables detected that could break parsing>,
      "hasColumns": <true if multi-column layout detected>,
      "hasFancyBullets": <true if non-standard bullet characters used>,
      "hasImages": <true if images/graphics mentioned or detected>,
      "issues": ["<specific formatting issues>"]
    },
    "contentChecks": {
      "hasEmptySections": <true if any standard sections are detected but empty>,
      "emptySectionsList": ["<list of empty sections>"],
      "educationMatch": {
        "match": <true ONLY if degree level matches or exceeds requirement. Bachelors < Masters. Ignore 'equivalent experience' clauses.>,
        "requiredLevel": "<level found in JD e.g. Bachelor, Master>",
        "foundLevel": "<highest level found in resume>"
      },
      "locationPresent": <true if physical address/city/state found>,
      "filenameSafe": <true if filename does not contain special characters other than - or _>,
      "hasSummary": <true if resume contains a summary/profile section>
    },
    "checks": [
      {
        "category": "<Contact|Headings|JobTitle|Dates|Formatting|Content>",
        "item": "<what was checked>",
        "status": "<pass|fail|warning>",
        "detail": "<specific finding>",
        "fix": "<actionable suggestion if not pass>"
      }
    ]
  },
  "recruiterTips": [
    {
      "category": "<category>",
      "tip": "<what was checked>",
      "status": "<pass|fail|warning>",
      "detail": "<specific finding from this resume>",
      "fix": "<actionable suggestion. MUST cover: 1. Renaming near-miss keywords. 2. Adding missing critical skills. 3. Fixing formatting.>"
    }
  ],
  "formatting": {
    "score": <0-100>,
    "hasProperSections": <true/false>,
    "hasCleanFormat": <true/false>,
    "hasProperLength": <true/false>,
    "issues": ["<issues found>"]
  },
  "resumeStructure": {
    "hasContact": <true/false>,
    "hasEmail": <true/false>,
    "hasPhone": <true/false>,
    "hasLinkedIn": <true/false>,
    "hasSummary": <true/false>,
    "summaryQuality": "<good|weak|missing>",
    "hasExperience": <true/false>,
    "experienceCount": <number>,
    "hasEducation": <true/false>,
    "hasSkillsSection": <true/false>,
    "detectedSections": ["<section names found>"]
  },
  "aiRewrites": {
    "summary": "<optimized summary tailored for THIS specific job>",
    "bullets": [
      {
        "original": "<actual bullet from resume>",
        "rewritten": "<improved version>",
        "improvement": "<what was improved>"
      }
    ],
    "skillSentences": [
      {
        "skill": "<missing skill from JD>",
        "sentence": "<natural sentence to add this skill>"
      }
    ]
  },
  "sideBySide": {
    "resumeKeywords": ["<important keywords found in resume>"],
    "jdKeywords": ["<important keywords found in JD>"],
    "matchedKeywords": ["<keywords present in BOTH>"],
    "missingKeywords": ["<JD keywords NOT in resume>"]
  }
}

CRITICAL: Return ONLY valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Remove markdown code blocks
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    // Try to parse JSON with better error handling
    let analysis: ATSAnalysisResult;
    try {
      analysis = JSON.parse(text) as ATSAnalysisResult;
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Problematic JSON (first 500 chars):', text.substring(0, 500));
      console.error('Problematic JSON (around error):', text.substring(Math.max(0, parseError.message.match(/\d+/)?.[0] - 100 || 0), parseError.message.match(/\d+/)?.[0] + 100 || 500));

      // Try to fix common issues
      let fixedText = text
        // Fix unescaped quotes in strings
        .replace(/: "([^"]*)"([^,}\]])/g, (match, content, after) => {
          // If there's a quote followed by something other than comma/brace/bracket, it's likely unescaped
          if (after && after !== ',' && after !== '}' && after !== ']') {
            return `: "${content.replace(/"/g, '\\"')}"${after}`;
          }
          return match;
        })
        // Fix unescaped newlines in strings
        .replace(/: "([^"]*\n[^"]*)"/g, (match, content) => {
          return `: "${content.replace(/\n/g, '\\n')}"`;
        });

      try {
        analysis = JSON.parse(fixedText) as ATSAnalysisResult;
        console.log('✓ JSON fixed and parsed successfully');
      } catch (secondError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
      }
    }

    // DEBUG: Log the "Anchor" skills to prove the AI extracted them first
    if ((analysis as any)._anchor_jd_hard_skills) {
      console.log('⚓ ANCHOR (Hard Skills):', (analysis as any)._anchor_jd_hard_skills.length, 'skills found');
      console.log('   Samples:', (analysis as any)._anchor_jd_hard_skills.slice(0, 5));
    }
    if ((analysis as any)._anchor_jd_soft_skills) {
      console.log('⚓ ANCHOR (Soft Skills):', (analysis as any)._anchor_jd_soft_skills.length, 'skills found');
    }

    // Recalculate Searchability Score deterministicly
    if (analysis.searchability && analysis.searchability.checks) {
      const totalChecks = analysis.searchability.checks.length;
      const passedChecks = analysis.searchability.checks.filter(c => c.status === 'pass').length;

      if (totalChecks > 0) {
        const calculatedScore = Math.round((passedChecks / totalChecks) * 100);
        analysis.searchability.score = calculatedScore;


        // SYNC: Propagate to the main match rate
        if (analysis.matchRate) {

          // STUBBORN MATCHER & DEDUPLICATION: Strict Code-Level Verification
          // 1. Deduplicate the lists first to stabilize the "Total Count" (Denominator)
          // This prevents "React" and "React.js" from artificially inflating the total.
          if (analysis.hardSkills) {
            // Import deduplicateSkills from matcher (it will be auto-imported or we assume it is available via the existing import)
            const { deduplicateSkills } = require('./matcher'); // Dynamic require if not imported at top, or just ensure import
            analysis.hardSkills = deduplicateSkills(analysis.hardSkills);
          }
          if (analysis.softSkills) {
            const { deduplicateSkills } = require('./matcher');
            analysis.softSkills = deduplicateSkills(analysis.softSkills);
          }

          // 2. Verify Matches (Numerator)
          // We do not trust the AI. We verify every "matched" skill against the raw text manually.
          if (analysis.hardSkills) {
            analysis.hardSkills = verifySkillMatches(resumeText, analysis.hardSkills);
          }
          if (analysis.softSkills) {
            analysis.softSkills = verifySkillMatches(resumeText, analysis.softSkills);
          }

          analysis.matchRate.searchability = calculatedScore;

          // Recalculate Hard Skills Score (Deterministic)
          if (analysis.hardSkills && analysis.hardSkills.length > 0) {
            const matchCount = analysis.hardSkills.filter(s => s.matched).length;
            const totalCount = analysis.hardSkills.length;
            const skillScore = Math.round((matchCount / totalCount) * 100);
            analysis.matchRate.hardSkills = skillScore;
          }

          // Recalculate Soft Skills Score (Deterministic)
          if (analysis.softSkills && analysis.softSkills.length > 0) {
            const matchCount = analysis.softSkills.filter(s => s.matched).length;
            const totalCount = analysis.softSkills.length;
            const skillScore = Math.round((matchCount / totalCount) * 100);
            analysis.matchRate.softSkills = skillScore;
          }

          // RECALCULATE OVERALL: Use deterministic weights
          // Hard Skills (40%) + Searchability (25%) + Soft Skills (20%) + Formatting (15%)
          const weightedScore = (
            (analysis.matchRate.hardSkills || 0) * 0.4 +
            (analysis.matchRate.searchability || 0) * 0.25 +
            (analysis.matchRate.softSkills || 0) * 0.2 +
            (analysis.matchRate.formatting || 0) * 0.15
          );
          analysis.matchRate.overall = Math.round(weightedScore);
        }

        // UNIFY: Ensure Side-by-Side data matches the Structured Skills data exactly
        const allHard = analysis.hardSkills || [];
        const allSoft = analysis.softSkills || [];

        const matchedHard = allHard.filter(s => s.matched).map(s => s.skill);
        const matchedSoft = allSoft.filter(s => s.matched).map(s => s.skill);

        const missingHard = allHard.filter(s => !s.matched).map(s => s.skill);
        const missingSoft = allSoft.filter(s => !s.matched).map(s => s.skill);

        analysis.sideBySide = {
          resumeKeywords: [...matchedHard, ...matchedSoft],
          jdKeywords: [...matchedHard, ...matchedSoft, ...missingHard, ...missingSoft],
          matchedKeywords: [...matchedHard, ...matchedSoft],
          missingKeywords: [...missingHard, ...missingSoft]
        };
      }
    }

    // SYNC: Ensure ContentChecks match the detailed checklist (Single Source of Truth)
    if (analysis.searchability && analysis.searchability.checks) {
      const eduCheck = analysis.searchability.checks.find(c => c.category === 'Content' && c.item.includes('Education'));
      if (eduCheck && eduCheck.status !== 'pass') {
        // Force the boolean flag to false if the detailed check failed
        analysis.searchability.contentChecks.educationMatch.match = false;
        console.log('[ATS Engine] Synced Education Match: FAIL (based on checklist)');
      }

      const locCheck = analysis.searchability.checks.find(c => c.category === 'Content' && c.item.includes('Location'));
      if (locCheck && locCheck.status !== 'pass') {
        analysis.searchability.contentChecks.locationPresent = false;
        console.log('[ATS Engine] Synced Location Check: FAIL (based on checklist)');
      }

      const titleCheck = analysis.searchability.checks.find(c => c.category === 'JobTitle' && c.item.includes('Title'));
      if (titleCheck && titleCheck.status !== 'pass') {
        analysis.searchability.jobTitleMatch.foundInResume = false;
        console.log('[ATS Engine] Synced Job Title: FAIL (based on checklist)');
      }
    }



    return analysis;
  } catch (error: any) {
    console.error('ATS Engine Error:', error);
    throw new Error(`ATS analysis failed: ${error.message}`);
  }
}
