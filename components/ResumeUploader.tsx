'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';

interface ResumeUploaderProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export default function ResumeUploader({ onFileSelect, selectedFile }: ResumeUploaderProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        setError(null);

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0]?.code === 'file-too-large') {
                setError('File size must be less than 10MB');
            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                setError('Only PDF and DOCX files are supported');
            } else {
                setError('Invalid file');
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 10 * 1024 * 1024,
        multiple: false,
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
        setError(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-3">
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
                    ${isDragActive
                        ? 'border-slate-400 bg-slate-50'
                        : selectedFile
                            ? 'border-green-300 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                    }
                `}
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FiUpload className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                            {isDragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
                        </p>
                        <p className="text-xs text-slate-400">
                            or click to browse
                        </p>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}
