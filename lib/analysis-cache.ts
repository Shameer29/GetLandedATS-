// Simple in-memory cache for analysis results
// This ensures 100% deterministic results for the same resume + JD combination

interface CacheEntry {
    result: any;
    timestamp: number;
}

class AnalysisCache {
    private cache: Map<string, CacheEntry> = new Map();
    private maxAge = 1000 * 60 * 60; // 1 hour cache lifetime

    // Dedicated Cache for Job Description Skill Extraction
    private jdCache: Map<string, CacheEntry> = new Map();

    // Helper: Normalize text to ignore "spacings" and "invisible changes"
    private normalizeKey(str: string): string {
        return str
            .trim()
            .replace(/\s+/g, ' ') // Collapse multiple spaces into one
            .toLowerCase();       // Case insensitive caching
    }

    private createStringHash(str: string): string {
        const normalized = this.normalizeKey(str);
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // ORIGINAL Methods (for full analysis caching) -> RESTORED
    private createKey(resumeText: string, jobDescription: string): string {
        return this.createStringHash(resumeText + '|||' + jobDescription);
    }

    get(resumeText: string, jobDescription: string): any | null {
        const key = this.createKey(resumeText, jobDescription);
        const entry = this.cache.get(key);
        if (entry && Date.now() - entry.timestamp < this.maxAge) {
            console.log('✅ Using cached Full Analysis');
            return entry.result;
        }
        return null;
    }

    set(resumeText: string, jobDescription: string, result: any): void {
        const key = this.createKey(resumeText, jobDescription);
        this.cache.set(key, { result, timestamp: Date.now() });
    }

    // NEW Methods (for JD Extraction)
    getJDSkills(jobDescription: string): any | null {
        const key = this.createStringHash(jobDescription);
        const entry = this.jdCache.get(key);
        if (entry && Date.now() - entry.timestamp < this.maxAge) {
            console.log('✅ Using cached JD skills');
            return entry.result;
        }
        return null;
    }

    setJDSkills(jobDescription: string, skills: any): void {
        const key = this.createStringHash(jobDescription);
        this.jdCache.set(key, { result: skills, timestamp: Date.now() });
        console.log('💾 Cached JD skills');
    }

    // Export singleton instance
}

export const analysisCache = new AnalysisCache();
