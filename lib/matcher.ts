import { SkillAnalysis } from "@/types";

/**
 * STRICT MATCHING ENGINE
 * 
 * This module enforces "Old ATS" rules programmatically.
 * It is the "Judge" that overrules the AI if the text isn't actually present.
 */

// Normalize text for comparison (retain minimal necessary structure)
function normalizeText(text: string): string {
    return text.toLowerCase()
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
}

/**
 * Verify if a keyword exists in the text using STRICT ATS rules.
 * 
 * Rules:
 * 1. Case-insensitive (Java == java)
 * 2. Whole Word Only (Java != Javascript)
 * 3. Symbol Aware (C++ != C, .NET != NET)
 */
export function verifyMatch(text: string, keyword: string): boolean {
    if (!text || !keyword) return false;

    const normalizedText = normalizeText(text);
    const normalizedKeyword = normalizeText(keyword);

    // Escape special regex characters
    const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // LIST OF SYMBOLS THAT MATTER IN TECH SKILLS
    // If the keyword ends with a symbol (C++, C#), we need to look for that specific boundary.
    // If it starts with a symbol (.NET), same.

    // Construct a Regex that respects word boundaries BUT allows symbols to be part of the word
    // "b" is word boundary. But "C++" doesn't end with a word character, so \b won't work after ++.
    // We need a custom lookahead/lookbehind approach.

    // Strategy: 
    // 1. Find the substring.
    // 2. Check the character immediately BEFORE and AFTER.
    // 3. If BEFORE is a letter/number, it's a part of another word -> FAIL (e.g. "VisualBasic" matching "Basic")
    // 4. If AFTER is a letter/number, it's a part of another word -> FAIL (e.g. "Javascript" matching "Java")

    const searchRegex = new RegExp(escapedKeyword, 'g');
    let match;

    while ((match = searchRegex.exec(normalizedText)) !== null) {
        const start = match.index;
        const end = start + normalizedKeyword.length;

        // Check character before
        const charBefore = start > 0 ? normalizedText[start - 1] : ' ';
        const isBoundaryBefore = /[\s\.,\/#!$%\^&\*;:{}=\-_`~()\[\]]/.test(charBefore);

        // Check character after
        const charAfter = end < normalizedText.length ? normalizedText[end] : ' ';
        const isBoundaryAfter = /[\s\.,\/#!$%\^&\*;:{}=\-_`~()\[\]]/.test(charAfter);

        // Allow alphanumerics if they are part of the keyword itself? No, we matched the keyword.
        // We just need to make sure the SURROUNDING chars are separators.

        // Edge Case: "Node.js" matched against "Node"
        // keyword="node", text="node.js"
        // charAfter = "." -> This is usually a separator, BUT for tech skills it might bind.
        // However, "Old ATS" usually breaks on dots. So "Node" matching "Node.js" is actually debatable.
        // But strict match says: If JD asks for "Node", and you have "Node.js", that IS a match.
        // If JD asks for "Node.js" and you have "Node", that is NOT a match.

        // Let's stick to standard Word Boundary logic but allow symbols in the keyword.

        // Special cleanup for C++ and C#
        // "C++" -> boundary check should allow space or punctuation after.
        // "C" -> boundary check MUST NOT allow "+" after.

        const isAlphaNumericBefore = /[a-z0-9]/.test(charBefore);
        let isAlphaNumericAfter = /[a-z0-9]/.test(charAfter);

        // EXTRA STRICTNESS:
        // If keyword is "C", and charAfter is "+", then it is NOT a match (it's C++)
        // If keyword is "C", and charAfter is "#", then it is NOT a match (it's C#)
        // If keyword is "Java", and charAfter is "s" (Javascript), it's NOT a match.

        if (keyword.toLowerCase() === 'c') {
            if (charAfter === '+' || charAfter === '#') isAlphaNumericAfter = true;
        }

        if (!isAlphaNumericBefore && !isAlphaNumericAfter) {
            return true;
        }
    }

    return false;
}

/**
 * Verify a list of skills against the resume text
 */
export function verifySkillMatches(text: string, skills: SkillAnalysis[]): SkillAnalysis[] {
    return skills.map(skill => {
        // GOD MODE: We do not trust the AI's "matched" boolean. 
        // We strictly check the text ourselves.
        // This ensures 100% Deterministic results. Case-insensitive, symbol-aware.

        const isActuallyThere = verifyMatch(text, skill.skill);

        if (isActuallyThere) {
            // It IS there. Ensure it's marked matched.
            return {
                ...skill,
                matched: true,
                // We could count exact occurrences here if we wanted deeper logic, 
                // but for now, just ensure boolean correctness.
                resumeCount: skill.resumeCount > 0 ? skill.resumeCount : 1
            };
        } else {
            // It is NOT there. Ensure it's marked missing.
            return {
                ...skill,
                matched: false,
                resumeCount: 0,
                context: "Not found in strict text scan"
            };
        }
    });
}

/**
 * Deduplicate skills to prevent scoring fluctuations.
 * If the AI extracts "React" and "react" as two separate skills, we merge them.
 * We also remove "noisy" skills that are too short to be meaningful (unless strictly allowed).
 */
export function deduplicateSkills(skills: SkillAnalysis[]): SkillAnalysis[] {
    const unique = new Map<string, SkillAnalysis>();

    for (const skill of skills) {
        const normalized = normalizeText(skill.skill);

        // Filter out garbage (empty or single char unless 'c' or 'r')
        if (normalized.length < 2 && normalized !== 'c' && normalized !== 'r') continue;

        // If not already present, or if the new one is "required" and the old one wasn't, keep the better one.
        if (!unique.has(normalized)) {
            unique.set(normalized, skill);
        } else {
            const existing = unique.get(normalized)!;
            // Merge logic: If either is required, the result is required.
            if (skill.required && !existing.required) {
                unique.set(normalized, { ...skill });
            }
        }
    }

    return Array.from(unique.values());
}
