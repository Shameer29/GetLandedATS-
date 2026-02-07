// Type definitions for ATS Resume Analyzer

export interface ResumeData {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  sections?: {
    contact?: string;
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
  };
  metadata?: {
    hasTables: boolean;
    hasColumns: boolean;
    hasImages: boolean;
    fileSize: number;
  };
}

export interface JobDescription {
  text: string;
  title?: string;
  company?: string;
}

export interface Keyword {
  term: string;
  category: 'technical' | 'soft' | 'industry' | 'action' | 'certification';
  frequency: number;
  importance: 'high' | 'medium' | 'low';
  status?: 'verified' | 'unverified';
  context?: string;
  jdFrequency?: number;
  resumeFrequency?: number;
}

export interface KeywordMatch {
  matched: Keyword[];
  missing: Keyword[];
  partial: Keyword[];
  extra?: Keyword[]; // Skills in resume but not in job description
}

export interface ATSScore {
  overall: number; // 0-100
  breakdown: {
    keywordMatch: number; // 0-100
    formatCompliance: number; // 0-100
    contentQuality: number; // 0-100
    optimization: number; // 0-100
  };
}

export interface FormatIssue {
  type: 'warning' | 'error';
  category: 'formatting' | 'structure' | 'content';
  message: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'keywords' | 'formatting' | 'content' | 'structure';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: number; // Expected score increase
  examples?: string[];
}

export interface AnalysisResult {
  score: ATSScore;
  keywordAnalysis: KeywordMatch;
  formatIssues: FormatIssue[];
  recommendations: Recommendation[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  resumeText?: string; // Optional, for comparison view
}

export interface AnalysisRequest {
  resume: ResumeData;
  jobDescription: JobDescription;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

// ATS Engine Types (moved from lib/ats-engine.ts to avoid circular deps)
export interface SkillAnalysis {
  skill: string;
  category: string;
  required: boolean;
  jdCount: number;
  resumeCount: number;
  matched: boolean;
  context?: string;
}
