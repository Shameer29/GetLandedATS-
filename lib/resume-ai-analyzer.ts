import 'server-only';
import { getGeminiModel } from './gemini';
import type {
  ResumeAnalysis,
  ExtractedSkill,
  ExperienceEntry,
  EducationEntry,
  BulletPoint,
  ContentQuality,
  FormattingAnalysis
} from '@/types/universal-ats';

/**
 * AI-Powered Resume Analyzer
 * Dynamically extracts ALL content from resume
 * NO HARDCODING - works for any resume format worldwide
 */
export async function analyzeResume(resumeText: string, fileType: 'pdf' | 'docx' = 'pdf'): Promise<ResumeAnalysis> {
  const model = getGeminiModel();

  const prompt = `You are a STRICT ATS (Applicant Tracking System) Parser Simulator. Your goal is to analyze the resume not just for content, but for "ATS Parsability".

CRITICAL ANALYSIS TASKS:
1. CONTENT EXTRACTION: Extract standard resume sections (Contact, Summary, Experience, Education, Skills).
2. PARSING SIMULATION: Identify elements that would break standard ATS parsers (e.g., tables, columns, graphics, text boxes, unusual fonts).
3. SECTION DETECTION: Verify if standard section headers are used (e.g., "Experience" vs "Where I've Been").
4. FORMATTING CHECKS:
   - Tables/Columns: Detection of complex layouts.
   - Date Formats: Are dates standard (MM/YYYY) or ambiguous?
   - Contact Info: Is it easily parsable? (e.g., "email[at]domain" might fail).
   - Buzzwords: Identify overused clichés ("hard worker", "team player").

RESUME TEXT:
${resumeText}

Return a JSON object with this EXACT structure:
{
  "contact": {
    "email": "email or null",
    "phone": "phone or null",
    "linkedin": "url or null",
    "github": "url or null",
    "portfolio": "url or null",
    "location": "text or null"
  },
  
  "summary": "professional summary text or null",
  
  "skills": [
    {
      "name": "skill name",
      "importance": "required",
      "frequency": number,
      "context": "brief text snippet"
    }
  ],
  
  "experience": [
    {
      "jobTitle": "title",
      "company": "company",
      "startDate": "YYYY-MM or string",
      "endDate": "YYYY-MM or 'Present'",
      "duration": "string",
      "isCurrent": boolean,
      "bulletPoints": [
        {
          "text": "full bullet text",
          "hasActionVerb": boolean,
          "actionVerb": "verb found or null",
          "hasMeasurableResult": boolean,
          "metrics": ["extracted numbers/metrics"],
          "hasWeakPhrase": boolean,
          "weakPhrases": ["found weak phrases e.g. 'responsible for'"],
          "score": number_0_to_100,
          "suggestions": ["improvement tip"]
        }
      ],
      "skills": ["skills in this role"]
    }
  ],
  
  "totalYearsOfExperience": number,
  
  "education": [
    {
      "degree": "degree",
      "field": "field",
      "institution": "university",
      "graduationDate": "date string",
      "gpa": "string or null"
    }
  ],
  
  "highestDegree": "string",
  "certifications": ["list of strings"],
  
  "contentQuality": {
    "actionVerbCount": number,
    "totalBullets": number,
    "bulletsWithMetrics": number,
    "bulletsWithWeakPhrases": number,
    "averageBulletScore": number,
    "wordCount": number,
    "uniqueSkillsCount": number
  },

  "formatting": {
    "fileType": "${fileType}",
    "hasContactInfo": boolean,
    "hasEmail": boolean,
    "hasPhone": boolean,
    "hasLinkedIn": boolean,
    "sectionsDetected": ["Summary", "Experience", "Education", "Skills", etc],
    "missingSections": ["list missing standard sections"],
    "isScannedPdf": false,
    "hasTablesOrColumns": boolean, // Set to true if complex layout suspected
    "specialCharacterCount": number, // Estimate based on text
    "estimatedPages": number // Estimate: ~500 words = 1 page
  }
}


STRICT GUIDANCE:
- If a section header is non-standard (e.g., "My Journey"), mark standard section as MISSING.
- If dates are not clearly associated with roles, flag distinct roles poorly.
- Be critical of "fluff" in bullet points.

ACTION VERBS (examples, not exhaustive):
Led, Developed, Created, Designed, Implemented, Achieved, Increased, Decreased, 
Managed, Built, Launched, Drove, Executed, Delivered, Optimized, Streamlined

WEAK PHRASES to detect:
"Responsible for", "Helped with", "Assisted in", "Worked on", "Participated in", 
"Involved in", "Tasked with", "Duties included"

METRICS to detect:
- Percentages: 40%, 150%
- Money: $1M, $50K, 1 million
- Numbers: 15 team members, 100+ customers, 3 projects`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const analysis = JSON.parse(text);

    // Add formatting analysis
    const formatting = analyzeFormatting(resumeText, fileType, analysis);

    return {
      ...analysis,
      formatting
    } as ResumeAnalysis;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
}

/**
 * Analyze resume formatting
 */
function analyzeFormatting(resumeText: string, fileType: 'pdf' | 'docx', analysis: any): FormattingAnalysis {
  const wordCount = resumeText.split(/\s+/).length;
  const estimatedPages = Math.ceil(wordCount / 500);

  // Detect potential issues
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com\/in\//.test(resumeText.toLowerCase());

  // Check for potential scanned PDF (very short text for normal resume)
  const isScannedPdf = fileType === 'pdf' && resumeText.length < 200;

  // Check for potential table/column issues (many short lines)
  const lines = resumeText.split('\n');
  const shortLines = lines.filter(l => l.trim().length > 0 && l.trim().length < 15);
  const hasTablesOrColumns = shortLines.length > lines.length * 0.4;

  // Count special characters
  const specialCharacterCount = (resumeText.match(/[^\w\s.,;:!?'"()\-@/]/g) || []).length;

  // Detect sections
  const sectionKeywords = ['experience', 'education', 'skills', 'summary', 'objective', 'certifications', 'projects'];
  const sectionsDetected = sectionKeywords.filter(keyword =>
    resumeText.toLowerCase().includes(keyword)
  );
  const missingSections = sectionKeywords.filter(keyword =>
    !resumeText.toLowerCase().includes(keyword)
  ).filter(s => ['experience', 'education', 'skills'].includes(s)); // Only flag critical sections

  return {
    fileType,
    hasContactInfo: hasEmail || hasPhone,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    sectionsDetected,
    missingSections,
    isScannedPdf,
    hasTablesOrColumns,
    specialCharacterCount,
    estimatedPages
  };
}

/**
 * Get all skills from resume analysis
 */
export function getResumeSkills(resumeAnalysis: ResumeAnalysis): string[] {
  const skills = new Set<string>();

  // Add skills from skills array
  resumeAnalysis.skills.forEach(skill => {
    skills.add(skill.name.toLowerCase());
  });

  // Add skills from experience
  resumeAnalysis.experience.forEach(exp => {
    exp.skills.forEach(skill => {
      skills.add(skill.toLowerCase());
    });
  });

  // Add certifications
  resumeAnalysis.certifications.forEach(cert => {
    skills.add(cert.toLowerCase());
  });

  return [...skills];
}

/**
 * Get resume text with highlights
 */
export function getHighlightedResume(
  resumeText: string,
  matchedSkills: string[],
  missingSkills: string[]
): string {
  let highlighted = resumeText;

  // This would be processed client-side for actual highlighting
  // Here we just return the text for now
  return highlighted;
}
