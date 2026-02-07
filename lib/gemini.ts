import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analysisCache } from './analysis-cache';

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini AI client (lazy loading)
 */
function initGemini() {
  if (!genAI) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Get Gemini model instance with STRICT deterministic settings
 */
export function getGeminiModel() {
  const client = initGemini();
  return client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0,        // Deterministic outputs
      topP: 0.1,             // Very focused
      topK: 1,               // Only top token
      maxOutputTokens: 8192,
      candidateCount: 1,
      responseMimeType: 'application/json',
      // @ts-ignore - seed is supported but not in types yet
      seed: 43,              // Reproducible output
    },
  });
}

/**
 * Analyze resume against job description using Gemini AI
 */
export async function analyzeWithGemini(resumeText: string, jobDescription: string) {
  // Check cache first for 100% deterministic results
  const cachedResult = analysisCache.get(resumeText, jobDescription);
  if (cachedResult) {
    return cachedResult;
  }

  const model = getGeminiModel();

  const prompt = `You are an [ATS_KEYWORD_ANALYZER], a precision keyword matching engine used by Fortune 500 companies. Your mission is to perform EXACT keyword matching between a RESUME and JOB DESCRIPTION.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON report with this EXACT structure:
{
  "summary": "Brief overall assessment (2-3 sentences)",
  "strengths": ["Specific strengths with evidence"],
  "weaknesses": ["Specific gaps in experience/skills"],
  "keywordAnalysis": {
    "matched": [
      {
        "term": "exact keyword from JD",
        "category": "Technical" | "Soft Skills" | "Industry",
        "importance": "high" | "medium" | "low",
        "status": "verified" | "unverified",
        "context": "Brief description of where/how found (e.g., 'Found in Experience section', 'Listed in Skills', 'Mentioned in project description')"
      }
    ],
    "missing": [
      {
        "term": "exact keyword from JD",
        "category": "Technical" | "Soft Skills" | "Industry",
        "importance": "high" | "medium" | "low"
      }
    ],
    "partial": [
      {
        "term": "keyword from JD",
        "category": "string",
        "importance": "string"
      }
    ],
    "extra": [
      {
        "term": "keyword",
        "category": "string",
        "relevance": "neutral" | "irrelevant"
      }
    ]
  },
  "formatIssues": [
    {"type": "warning|error", "category": "formatting|structure", "message": "issue", "impact": "high|medium", "suggestion": "fix"}
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "keywords|formatting|content",
      "title": "Action item title",
      "description": "Why this matters",
      "actionItems": ["Step 1", "Step 2"],
      "expectedImpact": number (1-20),
      "examples": ["Example"]
    }
  ],
  "scores": {
    "keywordMatch": number (0-100),
    "formatCompliance": number (0-100),
    "contentQuality": number (0-100),
    "optimization": number (0-100)
  }
}

[CRITICAL_MATCHING_RULES]:

⚠️ **ANTI-HALLUCINATION RULE #1**: 
NEVER mark a keyword as "matched" or "unverified" unless you can LITERALLY see that exact word (or its variants) in the resume text above.
If you CANNOT find the word in the resume, it MUST be marked as "missing". NO EXCEPTIONS.

⚠️ **ANTI-HALLUCINATION RULE #2**:
Do NOT infer matches from similar concepts. Just because the resume mentions "databases" does NOT mean "data warehousing" is matched.
Just because the resume mentions "background jobs" does NOT mean "queue-based execution" is matched.
BE LITERAL. BE STRICT. NO ASSUMPTIONS.

1. **EXACT MATCHING ONLY** (Case-Insensitive):
   - Mark as "matched" ONLY if the exact term or a direct variant appears in the resume
   - "collaborate" matches: "collaborate", "collaborated", "collaborating", "collaboration"
   - "collaborate" does NOT match: "teamwork", "worked with team", "coordinated"
   - "RESTful API" matches: "REST API", "RESTful APIs", "REST APIs", "restful api"
   - "React" matches: "React", "React.js", "ReactJS"
   - "Node.js" matches: "Node", "Node.js", "NodeJS"
   - "data warehousing" matches: "data warehousing", "data warehouse"
   - "data warehousing" does NOT match: "database", "SQL", "data storage"

2. **PARTIAL MATCHING Rules**:
   - Use "partial" ONLY when resume has a RELATED but NOT IDENTICAL term
   - Example: JD wants "AWS", resume has "Amazon Web Services" → PARTIAL
   - Example: JD wants "Kubernetes", resume has "container orchestration" → PARTIAL
   - Example: JD wants "Python", resume has "Python" → MATCHED (not partial!)
   - Example: JD wants "data warehousing", resume has "data analysis" → MISSING (not partial!)

3. **MISSING Keywords**:
   - Mark as "missing" if the term does NOT appear in ANY form in the resume
   - Be strict: if you can't find the exact word or its variants, it's missing
   - When in doubt, mark as MISSING, not matched

4. **Case Insensitivity**:
   - "JavaScript" = "javascript" = "JAVASCRIPT" = "Javascript"
   - "API" = "api" = "Api"
   - Always treat as case-insensitive when searching

5. **Variant Handling**:
   - Programming languages: "JavaScript"/"JS", "TypeScript"/"TS"
   - Frameworks: "React"/"React.js"/"ReactJS", "Node"/"Node.js"/"NodeJS"
   - Acronyms: "REST"/"RESTful", "API"/"APIs"
   
6. **Verification Status**:
   - "verified": Term appears in Experience section with context/achievement
   - "unverified": Term ONLY in Skills section or Summary
   - If term doesn't appear at all, DO NOT mark as matched or unverified - mark as MISSING

7. **Special Characters**:
   - "C++" = "C++" or "C plus plus"
   - ".NET" = ".NET" or "DOT NET" or "dotnet"

[SCORING RULES]:
- keywordMatch: (matched_count / total_jd_keywords) × 100
- Verified keywords count as 100%, unverified as 40%
- Partial keywords count as 50%
- Missing keywords count as 0%

[RECOMMENDATION GENERATION RULES]:

**Priority Classification:**
- HIGH: Missing critical skills/keywords with >15% impact, format errors, required certifications
- MEDIUM: Missing important keywords with 5-15% impact, content improvements, partial matches
- LOW: Nice-to-have keywords <5% impact, minor formatting, optional enhancements

**Recommendation Quality Standards:**
1. **Be Specific**: Don't say "Add technical skills" - say "Add Python, Docker, and Kubernetes to your Skills section"
2. **Be Actionable**: Every recommendation must have clear, executable steps
3. **Show Impact**: Quantify expected score improvement (realistic 1-20 points)
4. **Prioritize**: Focus on highest-impact changes first (max 5-7 recommendations total)
5. **Provide Examples**: Give concrete examples for each action item when possible

**Types of Recommendations:**
- Keywords: Add missing high-importance terms from JD
- Formatting: Fix ATS parsing issues (tables, columns, fonts)
- Content: Improve achievement descriptions with metrics
- Structure: Reorganize sections for better clarity
- Verification: Move skills from Skills section to Experience with context

**Examples of GOOD Recommendations:**
{
  "priority": "high",
  "category": "keywords",
  "title": "Add Critical Technical Skills",
  "description": "The job requires Python, Docker, and AWS, but these aren't in your resume. Adding them could increase your match score by 18%.",
  "actionItems": [
    "Add 'Python' to your Skills section if you have experience with it",
    "Include 'Docker' and 'AWS' in a project or experience description",
    "Mention specific Python frameworks used (e.g., Django, Flask)"
  ],
  "expectedImpact": 18,
  "examples": ["'Developed REST APIs using Python and Django, deployed on AWS using Docker containers'"]
}

**Examples of BAD Recommendations (AVOID):**
- "Improve your resume" (too vague)
- "Add more skills" (not specific)
- "Make it better" (no actionable steps)

[DETERMINISM]: SAME input MUST produce SAME output. Be precise and consistent.

Return ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(jsonText);

    // Store in cache for future requests with same resume+JD
    analysisCache.set(resumeText, jobDescription, analysis);

    return analysis;
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    throw new Error('Failed to analyze resume with AI');
  }
}

/**
 * Extract keywords from text using Gemini
 */
export async function extractKeywords(text: string, context: 'resume' | 'job') {
  const model = getGeminiModel();

  const prompt = `Extract all relevant keywords from the following ${context === 'resume' ? 'resume' : 'job description'}. 
  
TEXT:
${text}

Return a JSON array of keywords with their categories and importance:
[
  {"term": "keyword", "category": "technical|soft|industry|action|certification", "importance": "high|medium|low"}
]

Focus on:
- Technical skills (programming languages, tools, frameworks)
- Soft skills (leadership, communication, teamwork)
- Industry-specific terms
- Action verbs and achievements
- Certifications and qualifications

Return ONLY valid JSON, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();

    // Extract JSON from response
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw new Error('Failed to extract keywords');
  }
}
