import { NextResponse } from 'next/server';
import { analysisCache } from '@/lib/analysis-cache';

export async function POST() {
    try {
        analysisCache.clear();

        return NextResponse.json({
            success: true,
            message: 'Cache cleared successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to clear cache' },
            { status: 500 }
        );
    }
}
