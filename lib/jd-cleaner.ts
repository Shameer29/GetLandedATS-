import 'server-only';
import { getGeminiModel } from './gemini';

/**
 * Cleans job description text by removing irrelevant website content
 * (navigation, headers, footers, CTAs, metadata) and extracting only
 * the actual job description content.
 */
export async function cleanJobDescription(rawText: string): Promise<string> {
    // If the text is very short, it's likely already clean
    if (rawText.length < 200) {
        return rawText.trim();
    }

    try {
        const model = getGeminiModel();

        const prompt = `You are a job description content extractor. Your task is to analyze the provided text and extract ONLY the actual job description content, removing all irrelevant website elements.

**Remove ONLY these elements (Strictly UI/Navigation):**
- Navigation menus (Home, Careers, links)
- "Apply Now", "Save Job", "Share" buttons
- Copyright notices, Cookie warnings, Privacy Policy links
- "Posted X days ago", applicant counts
- Social media links/icons
- Website footer links

**PRESERVE EVERYTHING ELSE:**
- KEEP "About Us" / Company Culture (often lists tech stack like "We are a Java shop...")
- KEEP Benefits (often lists "Tuition reimbursement for certifications...")
- KEEP Legal/EEO statements (often lists "Must be US Citizen" or specific clearance)
- KEEP Salary ranges
- KEEP "Day in the Life"
- KEEP Project contexts
- KEEP Contact info

**Instructions:**
1. Identify ALL job-related content. BE AWARE: Skills and duties may be hidden in unstructured paragraphs, "About Us" intros, or project descriptions.
2. Aggressively remove all website navigation, metadata, and legal/HR fluff.
3. Return ONLY the cleaned job description text.
4. Maintain the original flow, even if it is unstructured.
5. If no valid job description is found (e.g. only login screen text), return "NO_VALID_JD_FOUND".

**Input Text:**
${rawText}

**Output:**
Return only the cleaned job description content, preserving the structure.`;

        const result = await model.generateContent(prompt);
        const cleanedText = result.response.text().trim();

        // Check if Gemini determined no valid JD was present
        if (cleanedText === 'NO_VALID_JD_FOUND' || cleanedText.length < 100) {
            throw new Error('No valid job description found in the provided text');
        }

        return cleanedText;
    } catch (error) {
        console.error('Error cleaning job description:', error);
        // If cleaning fails, return the original text
        // This ensures the analysis still proceeds even if the cleaner fails
        return rawText.trim();
    }
}
