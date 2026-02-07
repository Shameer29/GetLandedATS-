import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { AnalysisResult, FormatIssue } from '@/types';

interface ChecklistItem {
    status: 'pass' | 'fail' | 'info' | 'warning';
    message: string;
    action?: string;
}

interface ChecklistSection {
    title: string;
    items: ChecklistItem[];
}

interface ResumeChecklistProps {
    result: AnalysisResult;
    resumeText: string;
    jobDescription: string;
    fileName?: string;
}

export default function ResumeChecklist({ result, resumeText, jobDescription, fileName = 'resume.pdf' }: ResumeChecklistProps) {
    // Extract format issues by category
    const contactIssues = result.formatIssues.filter(issue =>
        issue.message.toLowerCase().includes('contact') ||
        issue.message.toLowerCase().includes('email') ||
        issue.message.toLowerCase().includes('phone')
    );

    const structureIssues = result.formatIssues.filter(issue => issue.category === 'structure');
    const formatIssues = result.formatIssues.filter(issue => issue.category === 'formatting');

    // Check contact information dynamically
    const hasEmail = resumeText.match(/\b[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}\b/);
    const hasPhone = resumeText.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    const hasAddress = resumeText.match(/\b\d{5}\b/) || resumeText.match(/[A-Z]{2}\s*\d{5}/);

    // Check sections
    const hasSummary = resumeText.match(/summary|profile|objective|about/i);
    const hasEducation = resumeText.match(/education|academic/i);
    const hasExperience = resumeText.match(/experience|work history|employment/i);
    const hasDates = resumeText.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\b/i);

    // File type check
    const isPDF = fileName.toLowerCase().endsWith('.pdf');
    const hasSpecialChars = /[^a-zA-Z0-9._-]/.test(fileName.replace(/\.pdf|\.docx/i, ''));
    const isConciseFileName = fileName.length <= 50;

    const sections: ChecklistSection[] = [
        {
            title: 'Contact Information',
            items: [
                {
                    status: hasEmail ? 'pass' : 'fail',
                    message: hasEmail
                        ? 'You provided your email. Recruiters use your email to contact you for job matches.'
                        : 'We did not find an email in your resume. Recruiters use your email to contact you for job matches.',
                },
                {
                    status: hasPhone ? 'pass' : 'fail',
                    message: hasPhone
                        ? 'You provided your phone number.'
                        : 'We did not find a phone number in your resume.',
                },
                {
                    status: hasAddress ? 'pass' : 'fail',
                    message: hasAddress
                        ? 'You provided your address. Recruiters use your address to validate your location for job matches.'
                        : 'We did not find an address in your resume or the address is incomplete. Recruiters use your address to validate your location for job matches.',
                },
            ],
        },
        {
            title: 'Summary',
            items: [
                {
                    status: hasSummary ? 'pass' : 'info',
                    message: hasSummary
                        ? "We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position."
                        : 'We did not find a summary section. Consider adding a professional summary to highlight your key qualifications.',
                },
            ],
        },
        {
            title: 'Section Headings',
            items: [
                {
                    status: hasEducation ? 'pass' : 'fail',
                    message: hasEducation
                        ? 'We found the education section in your resume.'
                        : 'We did not find an education section in your resume.',
                },
                {
                    status: hasExperience ? 'pass' : 'fail',
                    message: hasExperience
                        ? 'We found the work experience section in your resume.'
                        : 'We did not find a work experience section in your resume.',
                },
                {
                    status: resumeText.match(/\b(19|20)\d{2}\b/) ? 'pass' : 'info',
                    message: resumeText.match(/\b(19|20)\d{2}\b/)
                        ? 'We found work history with dates in your resume.'
                        : 'We did not find clear date information in your resume.',
                },
            ],
        },
        {
            title: 'Keyword Match',
            items: [
                {
                    status: result.keywordAnalysis.matched.length >= 5 ? 'pass' : result.keywordAnalysis.matched.length >= 2 ? 'info' : 'fail',
                    message: `You matched ${result.keywordAnalysis.matched.length} out of ${result.keywordAnalysis.matched.length + result.keywordAnalysis.missing.length} key terms from the job description. ${result.keywordAnalysis.matched.length >= 5
                            ? 'Great job! Your resume aligns well with the requirements.'
                            : result.keywordAnalysis.matched.length >= 2
                                ? 'Consider adding more relevant keywords to improve your match rate.'
                                : 'Your keyword match rate is low. Review the missing keywords section and add relevant ones to your resume.'
                        }`,
                },
            ],
        },
        {
            title: 'Date Formatting',
            items: [
                {
                    status: hasDates ? 'pass' : 'info',
                    message: hasDates
                        ? 'The dates in your work experience section are properly formatted.'
                        : 'Consider using standard date formats (e.g., Jan 2020, January 2020) for better ATS parsing.',
                },
            ],
        },
        {
            title: 'ATS Score',
            items: [
                {
                    status: result.score.breakdown.formatCompliance >= 80 ? 'pass' : result.score.breakdown.formatCompliance >= 60 ? 'info' : 'warning',
                    message: `Your format compliance score is ${result.score.breakdown.formatCompliance}%. ${result.score.breakdown.formatCompliance >= 80
                            ? 'Your resume is well-formatted for ATS systems.'
                            : result.score.breakdown.formatCompliance >= 60
                                ? 'Your resume format is acceptable, but could be improved.'
                                : 'Your resume may have formatting issues that could affect ATS parsing.'
                        }`,
                },
                {
                    status: result.score.breakdown.contentQuality >= 80 ? 'pass' : result.score.breakdown.contentQuality >= 60 ? 'info' : 'warning',
                    message: `Your content quality score is ${result.score.breakdown.contentQuality}%. ${result.score.breakdown.contentQuality >= 80
                            ? 'Your resume content is strong and well-written.'
                            : result.score.breakdown.contentQuality >= 60
                                ? 'Your resume content is good, but could be enhanced with more specific achievements.'
                                : 'Consider improving your resume content with quantifiable achievements and specific examples.'
                        }`,
                },
            ],
        },
        {
            title: 'File Type',
            items: [
                {
                    status: isPDF ? 'pass' : 'info',
                    message: isPDF
                        ? 'You are using a .pdf resume, which is the preferred format for most ATS systems.'
                        : 'You are using a .docx file. While acceptable, PDF is generally preferred for ATS systems.',
                },
                {
                    status: !hasSpecialChars ? 'pass' : 'warning',
                    message: !hasSpecialChars
                        ? "Your file name doesn't contain special characters that could cause an error in ATS."
                        : "Your file name contains special characters. Consider using only letters, numbers, and underscores.",
                },
                {
                    status: isConciseFileName ? 'pass' : 'info',
                    message: isConciseFileName
                        ? 'Your file name is concise and readable.'
                        : 'Consider using a shorter, more concise file name.',
                },
            ],
        },
    ];

    const StatusIcon = ({ status }: { status: 'pass' | 'fail' | 'info' | 'warning' }) => {
        switch (status) {
            case 'pass':
                return <FiCheckCircle className="text-green-500 text-lg shrink-0" />;
            case 'fail':
                return <FiXCircle className="text-red-500 text-lg shrink-0" />;
            case 'warning':
                return <FiAlertCircle className="text-amber-500 text-lg shrink-0" />;
            case 'info':
                return <FiInfo className="text-blue-500 text-lg shrink-0" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-xl font-semibold text-slate-900">Resume Validation</h3>
                    <p className="text-sm text-slate-600 mt-1">
                        Comprehensive check of your resume structure and formatting
                    </p>
                </div>

                <div className="divide-y divide-slate-100">
                    {sections.map((section, idx) => (
                        <div key={idx} className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-semibold shrink-0">
                                    {idx + 1}
                                </div>
                                <h4 className="text-base font-semibold text-slate-800 pt-1">{section.title}</h4>
                            </div>

                            <div className="ml-11 space-y-3">
                                {section.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-start gap-3">
                                        <StatusIcon status={item.status} />
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700 leading-relaxed">{item.message}</p>
                                            {item.action && (
                                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">
                                                    {item.action}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
