'use client';

import { useEffect, useRef } from 'react';

interface JobDescriptionInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.max(200, textareaRef.current.scrollHeight) + 'px';
        }
    }, [value]);

    const charCount = value.length;
    const isMinMet = charCount >= 50;

    return (
        <div className="space-y-2">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full min-h-[200px] p-4 text-sm text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
            />
            <div className="flex justify-between items-center">
                <p className={`text-xs ${isMinMet ? 'text-slate-400' : 'text-amber-600'}`}>
                    {isMinMet ? `${charCount} characters` : `${charCount}/50 minimum characters`}
                </p>
            </div>
        </div>
    );
}
