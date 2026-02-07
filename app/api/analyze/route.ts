import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/resume-parser';
import { cleanJobDescription } from '@/lib/jd-cleaner';
import { runATSAnalysis } from '@/lib/ats-engine';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const resumeFile = formData.get('resume') as File;
        const jobDescription = formData.get('jobDescription') as string;

        // Validate inputs
        if (!resumeFile) {
            return NextResponse.json(
                { success: false, error: 'Resume file is required' },
                { status: 400 }
            );
        }

        if (!jobDescription || jobDescription.trim().length < 50) {
            return NextResponse.json(
                { success: false, error: 'Job description must be at least 50 characters' },
                { status: 400 }
            );
        }

        console.log('[API] Starting analysis...');

        // Parse resume
        const resumeData = await parseResume(resumeFile);
        console.log('[API] Resume parsed, length:', resumeData.text.length);

        // Clean job description
        const cleanedJD = await cleanJobDescription(jobDescription);
        console.log('[API] JD cleaned, length:', cleanedJD.length);

        // Run the new powerful ATS analysis
        const atsResult = await runATSAnalysis(resumeData.text, cleanedJD, resumeData.metadata, resumeData.fileName);
        console.log('[API] ATS analysis complete, overall:', atsResult.matchRate.overall);

        return NextResponse.json({
            success: true,
            data: {
                atsResult,
                resumeText: resumeData.text,
            }
        });
    } catch (error: any) {
        console.error('[API] Analysis error:', error);
        console.error('[API] Error stack:', error.stack);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to analyze resume. Please try again.',
                errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
