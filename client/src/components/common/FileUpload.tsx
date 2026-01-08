import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';

interface FileUploadProps {
    label?: string;
    accept?: string;
    maxSize?: number; // in MB
    onFileSelect: (file: File) => void;
    currentFile?: string;
    uploadType?: 'receipt' | 'logo' | 'attachment' | 'invoice';
    disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label = 'Upload File',
    accept = 'image/*,application/pdf',
    maxSize = 5,
    onFileSelect,
    currentFile,
    uploadType = 'attachment',
    disabled = false,
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentFile || null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const validateFile = (file: File): string | null => {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            return `File size must be less than ${maxSize}MB`;
        }

        // Check file type
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileType = file.type;
        const isAccepted = acceptedTypes.some(type => {
            if (type.endsWith('/*')) {
                const category = type.split('/')[0];
                return fileType.startsWith(category + '/');
            }
            return fileType === type;
        });

        if (!isAccepted) {
            return 'File type not supported';
        }

        return null;
    };

    const handleFile = (file: File) => {
        setError(null);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        onFileSelect(file);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    const getUploadIcon = () => {
        switch (uploadType) {
            case 'receipt':
                return '🧾';
            case 'logo':
                return '🖼️';
            case 'invoice':
                return '📄';
            default:
                return '📎';
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
                    {label}
                </label>
            )}

            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950'
                        : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={!disabled ? handleButtonClick : undefined}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label="Upload file"
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                    disabled={disabled}
                    aria-label={label || 'File upload input'}
                />

                {preview ? (
                    <div className="space-y-3">
                        {preview.startsWith('data:image') ? (
                            <img
                                src={preview}
                                alt="File preview"
                                className="mx-auto h-32 w-auto rounded-lg object-contain border border-neutral-200 dark:border-neutral-700"
                            />
                        ) : (
                            <div className="text-4xl" aria-hidden="true">{getUploadIcon()}</div>
                        )}
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">File selected</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreview(null);
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                }
                            }}
                            disabled={disabled}
                            aria-label="Remove selected file"
                        >
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-4xl" aria-hidden="true">{getUploadIcon()}</div>
                        <div className="text-sm text-neutral-700 dark:text-neutral-300">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span>{' '}
                            or drag and drop
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {accept.includes('image') && 'Images or '}PDF up to {maxSize}MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400" role="alert">{error}</p>
            )}
        </div>
    );
};
