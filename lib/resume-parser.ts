import mammoth from 'mammoth';
import { ResumeData } from '@/types';

interface ParserResult {
    text: string;
    metadata: {
        hasTables: boolean;
        hasColumns: boolean;
        hasImages: boolean;
    };
}

/**
 * Reorder extracted text to ensure logical flow
 * Fixes PDF extraction issues where sections appear before header/contact info
 */
function reorderExtractedText(text: string): string {
    const lines = text.split('\n');

    const sectionHeaders = [
        'PROFESSIONAL EXPERIENCE',
        'WORK EXPERIENCE',
        'EXPERIENCE',
        'EDUCATION',
        'SKILLS',
        'PROFESSIONAL SUMMARY'
    ];

    const contactPatterns = [
        /mobile:|phone:|email:|linkedin:/i,
        /\+?\d{2,3}[\s-]?\d{3,4}[\s-]?\d{4,}/,
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
        /linkedin\.com/i
    ];

    // Find first section header and first contact info
    let firstSectionIndex = -1;
    let firstContactIndex = -1;

    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const line = lines[i].trim();

        if (firstSectionIndex === -1 && sectionHeaders.some(h => line.toUpperCase().includes(h))) {
            firstSectionIndex = i;
        }

        if (firstContactIndex === -1 && contactPatterns.some(p => p.test(line))) {
            firstContactIndex = i;
        }
    }

    // If section appears before contact, reorder
    if (firstSectionIndex !== -1 && firstContactIndex !== -1 && firstSectionIndex < firstContactIndex) {
        console.log('[PDF Reorder] Fixing extraction order');

        const headerLines: string[] = [];
        const bodyLines: string[] = [];
        let foundSection = false;

        for (const line of lines) {
            if (!foundSection && sectionHeaders.some(h => line.trim().toUpperCase().includes(h))) {
                foundSection = true;
            }

            if (foundSection) {
                bodyLines.push(line);
            } else {
                headerLines.push(line);
            }
        }

        return [...headerLines, '', ...bodyLines].join('\n');
    }

    return text;
}

/**
 * Parse PDF file using pdf-parse with custom configuration
 * Uses Mozilla's PDF.js engine - industry standard for PDF text extraction
 */
async function parsePDF(buffer: Buffer): Promise<ParserResult> {
    try {
        // Dynamic require to avoid test file loading on import
        const pdf = require('pdf-parse');
        // Configure pdf-parse options
        const options = {
            max: 0, // Parse all pages
        };

        const data = await pdf(buffer, options);

        // Clean up the text
        let cleanedText = data.text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        // Reorder text to fix extraction order issues (e.g., sections before header)
        cleanedText = reorderExtractedText(cleanedText);

        return {
            text: cleanedText,
            metadata: {
                hasTables: false,
                hasColumns: false,
                hasImages: false
            }
        };
    } catch (error: any) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file');
    }
}

async function parseDOCX(buffer: Buffer): Promise<ParserResult> {
    try {
        const textResult = await mammoth.extractRawText({ buffer });
        const AdmZip = require('adm-zip');
        const zip = new AdmZip(buffer);

        let hasImages = false;
        let hasTables = false;
        let hasColumns = false;

        try {
            const documentXml = zip.readAsText('word/document.xml');

            const drawingPattern = /<w:drawing[\s>]/g;
            const pictPattern = /<w:pict[\s>]/g;
            const blipPattern = /<a:blip[\s>]/g;

            const drawingMatches = documentXml.match(drawingPattern) || [];
            const pictMatches = documentXml.match(pictPattern) || [];
            const blipMatches = documentXml.match(blipPattern) || [];

            hasImages = drawingMatches.length > 0 || pictMatches.length > 0 || blipMatches.length > 0;

            const tablePattern = /<w:tbl[\s>]/g;
            const tableMatches = documentXml.match(tablePattern) || [];
            hasTables = tableMatches.length > 0;

            const colsPattern = /<w:cols\s+w:num="(\d+)"/g;
            let colMatch;
            while ((colMatch = colsPattern.exec(documentXml)) !== null) {
                const numCols = parseInt(colMatch[1]);
                if (numCols > 1) {
                    hasColumns = true;
                    break;
                }
            }
        } catch (xmlError) {
            console.warn('Could not analyze DOCX XML structure:', xmlError);
        }

        return {
            text: textResult.value,
            metadata: { hasTables, hasColumns, hasImages }
        };
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file');
    }
}

export async function parseResume(file: File): Promise<ResumeData> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';

    let result: ParserResult;

    if (fileType === 'pdf') {
        result = await parsePDF(buffer);
    } else if (fileType === 'docx') {
        result = await parseDOCX(buffer);
    } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX files only.');
    }

    let { text, metadata } = result;

    text = text
        .replace(/\r\n/g, '\n') // Normalize Windows line endings
        .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
        .trim();

    if (!text || text.length < 50) {
        throw new Error('Could not extract meaningful text from the file. Please ensure the file is not corrupted or password-protected.');
    }

    return {
        text,
        fileName: file.name,
        fileType,
        sections: detectSections(text),
        metadata: { ...metadata, fileSize: file.size }
    };
}

function detectSections(text: string) {
    const sections: ResumeData['sections'] = {};

    const sectionPatterns = {
        contact: /^(contact|personal\s+information|contact\s+information)/im,
        summary: /^(summary|professional\s+summary|profile|objective|about\s+me)/im,
        experience: /^(experience|work\s+experience|employment|professional\s+experience|work\s+history)/im,
        education: /^(education|academic\s+background|qualifications)/im,
        skills: /^(skills|technical\s+skills|core\s+competencies|expertise)/im,
    };

    const lines = text.split('\n');
    let currentSection: keyof typeof sections | null = null;
    let sectionContent: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        let foundSection = false;
        for (const [section, pattern] of Object.entries(sectionPatterns)) {
            if (pattern.test(trimmedLine)) {
                if (currentSection && sectionContent.length > 0) {
                    sections[currentSection] = sectionContent.join('\n').trim();
                }

                currentSection = section as keyof typeof sections;
                sectionContent = [];
                foundSection = true;
                break;
            }
        }

        if (!foundSection && currentSection && trimmedLine) {
            sectionContent.push(trimmedLine);
        }
    }

    if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n').trim();
    }

    return sections;
}

export function validateResumeFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.docx'];

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 10MB' };
    }

    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
        return { valid: false, error: 'Only PDF and DOCX files are supported' };
    }

    return { valid: true };
}
