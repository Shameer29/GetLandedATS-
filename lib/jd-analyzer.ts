import 'server-only';
import { getGeminiModel } from './gemini';
import type {
    JDAnalysis,
    ExtractedSkill,
    ExperienceRequirement,
    EducationRequirement
} from '@/types/universal-ats';

/**
 * AI-Powered JD Analyzer
 * Dynamically extracts ALL requirements from job description
 * NO HARDCODING - works for any job, any industry, worldwide
 */
export async function analyzeJobDescription(jobDescriptionText: string): Promise<JDAnalysis> {
    const model = getGeminiModel();

    const prompt = `You are an exhaustive, industry-agnostic Job Description Analyzer. Your task is to extract EVERY requirement, skill, and qualification from the provided text.

CRITICAL EXTRACTION RULES:
1. EXHAUSTIVE EXTRACTION: Identify EVERY hard skill, soft skill, tool, framework, methodology, certification, and competency mentioned.
2. EMBEDDED SKILLS: Extract skills even if embedded within sentences or responsibilities. If a sentence implies a skill is needed, extract it.
3. NO DOMAIN BIAS: This could be ANY industry. Extract exactly what is stated without assuming a specific field.
4. PRECISE TERMINOLOGY: Use the exact terms from the JD. Standardize only when the JD uses multiple names for the same thing.
5. DETECT IMPORTANCE:
   - REQUIRED: Words like "must have", "required", "essential", "mandatory"
   - PREFERRED: Words like "nice to have", "preferred", "desired", "bonus"
   - If unmarked but in main skills list -> REQUIRED
6. CAPTURE ALL VARIATIONS: If multiple names for the same skill appear, list them as variants.
7. EVERY ACTION COUNTS: If the JD describes an action or responsibility, extract the underlying skill needed.

JOB DESCRIPTION:
${jobDescriptionText}

Return a JSON object with this EXACT structure:
{
  "jobTitle": "exact job title",
  "company": "company name if available",
  "jobLevel": "entry" | "mid" | "senior" | "lead" | "manager" | "director" | "executive" | "unknown",
  
  "hardSkills": [
    {
      "name": "standardized skill name",
      "importance": "required" | "preferred" | "bonus",
      "frequency": number_of_times_mentioned_or_implied,
      "context": "excerpt where it appears",
      "variants": ["alternative names found in text"]
    }
  ],
  
  "softSkills": [
    {
      "name": "soft skill name",
      "importance": "required" | "preferred" | "bonus",
      "frequency": number_of_times_mentioned_or_implied,
      "context": "excerpt where it appears"
    }
  ],
  
  "experience": {
    "minimumYears": number_or_null,
    "maximumYears": number_or_null,
    "preferredYears": number_or_null,
    "description": "exact experience text",
    "level": "derived level"
  },
  
  "education": {
    "degree": "high_school" | "associate" | "bachelor" | "master" | "phd" | "any" | "not_specified",
    "field": "field of study if mentioned",
    "isRequired": boolean,
    "description": "text description"
  },
  
  "certifications": ["list of required/preferred certifications"],
  
  "industryTerms": ["industry-specific terminology, acronyms, or methodologies"],
  
  "responsibilities": ["key duties extracted"],
  
  "preferredQualifications": ["items listed as preferred/desirable"],
  
  "requiredQualifications": ["items listed as mandatory/required"]
}

FINAL CHECKLIST:
- Did you extract EVERY tool and technology mentioned?
- Did you extract skills implied by responsibilities?
- Did you capture both acronyms AND full names when both appear?
- Did you mark skills from explicit skills sections as REQUIRED?
- Did you count frequency of EACH skill accurately?`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const analysis = JSON.parse(text) as JDAnalysis;

        // Validate and normalize
        return normalizeJDAnalysis(analysis);
    } catch (error) {
        console.error('Error analyzing JD:', error);
        throw new Error('Failed to analyze job description');
    }
}

/**
 * Normalize and validate JD analysis response
 */
function normalizeJDAnalysis(analysis: JDAnalysis): JDAnalysis {
    return {
        jobTitle: analysis.jobTitle || 'Unknown Position',
        company: analysis.company || undefined,
        jobLevel: analysis.jobLevel || 'unknown',

        hardSkills: (analysis.hardSkills || []).map(normalizeSkill),
        softSkills: (analysis.softSkills || []).map(normalizeSkill),

        experience: normalizeExperience(analysis.experience),
        education: normalizeEducation(analysis.education),

        certifications: analysis.certifications || [],
        industryTerms: analysis.industryTerms || [],
        responsibilities: analysis.responsibilities || [],
        preferredQualifications: analysis.preferredQualifications || [],
        requiredQualifications: analysis.requiredQualifications || [],
    };
}

function normalizeSkill(skill: ExtractedSkill): ExtractedSkill {
    return {
        name: skill.name || '',
        importance: skill.importance || 'preferred',
        frequency: skill.frequency || 1,
        context: skill.context,
        variants: skill.variants || [],
    };
}

function normalizeExperience(exp: ExperienceRequirement | undefined): ExperienceRequirement {
    if (!exp) {
        return {
            minimumYears: undefined,
            maximumYears: undefined,
            preferredYears: undefined,
            description: 'Not specified',
            level: 'any',
        };
    }
    return {
        minimumYears: exp.minimumYears ?? undefined,
        maximumYears: exp.maximumYears ?? undefined,
        preferredYears: exp.preferredYears ?? undefined,
        description: exp.description || 'Not specified',
        level: exp.level || 'any',
    };
}

function normalizeEducation(edu: EducationRequirement | undefined): EducationRequirement {
    if (!edu) {
        return {
            degree: 'not_specified',
            field: undefined,
            isRequired: false,
            description: 'Not specified',
        };
    }
    return {
        degree: edu.degree || 'not_specified',
        field: edu.field || undefined,
        isRequired: edu.isRequired ?? false,
        description: edu.description || 'Not specified',
    };
}

/**
 * Extract just the key skills from JD for quick matching
 */
export function getJDKeywords(jdAnalysis: JDAnalysis): string[] {
    const keywords: string[] = [];

    // Add all hard skills
    jdAnalysis.hardSkills.forEach(skill => {
        keywords.push(skill.name.toLowerCase());
        skill.variants?.forEach(v => keywords.push(v.toLowerCase()));
    });

    // Add all soft skills
    jdAnalysis.softSkills.forEach(skill => {
        keywords.push(skill.name.toLowerCase());
    });

    // Add certifications
    jdAnalysis.certifications.forEach(cert => {
        keywords.push(cert.toLowerCase());
    });

    // Add industry terms
    jdAnalysis.industryTerms.forEach(term => {
        keywords.push(term.toLowerCase());
    });

    return [...new Set(keywords)]; // Remove duplicates
}
