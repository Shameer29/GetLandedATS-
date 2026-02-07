import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'ATS Resume Analyzer - Optimize Your Resume for ATS',
  description: 'AI-powered resume analysis tool that helps you optimize your resume for Applicant Tracking Systems. Get detailed feedback, keyword analysis, and actionable recommendations.',
  keywords: 'ATS, resume analyzer, resume optimization, job application, career tools, AI resume checker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}
