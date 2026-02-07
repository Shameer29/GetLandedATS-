'use client';

import React from 'react';

interface HighlightedSkillsProps {
  resumeText: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export default function HighlightedSkills({
  resumeText,
  matchedSkills,
  missingSkills
}: HighlightedSkillsProps) {
  if (!resumeText) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Resume text not available for highlighting</p>
      </div>
    );
  }

  const highlightedText = () => {
    let result = resumeText;
    const highlights: { start: number; end: number; type: 'matched' }[] = [];

    const lowerText = resumeText.toLowerCase();

    matchedSkills.forEach(skill => {
      let pos = 0;
      const lowerSkill = skill.toLowerCase();
      while ((pos = lowerText.indexOf(lowerSkill, pos)) !== -1) {
        highlights.push({ start: pos, end: pos + skill.length, type: 'matched' });
        pos += skill.length;
      }
    });

    highlights.sort((a, b) => a.start - b.start);

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    highlights.forEach((h, i) => {
      if (h.start > lastEnd) {
        parts.push(<span key={`text-${i}`}>{resumeText.slice(lastEnd, h.start)}</span>);
      }
      if (h.start >= lastEnd) {
        parts.push(
          <mark
            key={`highlight-${i}`}
            className="bg-green-100 text-green-800 px-0.5 rounded font-medium"
          >
            {resumeText.slice(h.start, h.end)}
          </mark>
        );
        lastEnd = h.end;
      }
    });

    if (lastEnd < resumeText.length) {
      parts.push(<span key="text-last">{resumeText.slice(lastEnd)}</span>);
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">Highlighted Resume</h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
            {matchedSkills.length} skills found
          </span>
        </div>
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700 mb-2 font-medium">Missing Skills to Add:</p>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((skill, i) => (
              <span key={i} className="text-xs bg-white border border-red-200 text-red-700 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resume Text */}
      <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
          {highlightedText()}
        </div>
      </div>
    </div>
  );
}
