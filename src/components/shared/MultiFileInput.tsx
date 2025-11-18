// components/MultiFileInput.tsx
'use client';

import {forwardRef, useState, useImperativeHandle, ChangeEvent, useEffect} from 'react';
import {
    FileInputBaseProps,
    useFileInputLogic,
} from '@/lib/hooks/useFileInputLogic';
import clsx from 'clsx';
import {Upload, X, File as FileIcon} from 'lucide-react';
import Image from 'next/image';
import {BASE_MIMES} from "@/lib/constants/constant";
import {formatFileSize} from "@/lib/utils/helper";

export interface MultiFileInputProps extends FileInputBaseProps {
    defaultFileUrls?: string[]; // Changed from defaultImageUrls
    onChange?: (files: File[]) => void;
    maxFiles?: number; // New prop for maximum number of files
}

export const MultiFileInput = forwardRef<{ input: HTMLInputElement | null; reset: () => void }, MultiFileInputProps>(
    ({
         error,
         label,
         helperText,
         className,
         showPreview = true,
         maxSizeMB = 10,
         defaultFileUrls, // Changed from defaultImageUrls
         readOnly = false,
         onChange,
         maxFiles = 10, // Destructure maxFiles and set default to 10
         ...props
     }, ref) => {
        const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
        const [dragActive, setDragActive] = useState(false);

        const validateFile = (file: File): string | null => {
            if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
                return `File size must be less than ${maxSizeMB}MB`;
            }
            if (props.accept) {
                const acceptedTypes = props.accept.split(',').map(t => t.trim());
                const fileType = file.type;
                const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                const isAccepted = acceptedTypes.some(type => {
                    if (type.startsWith('.')) return fileExtension === type.toLowerCase();
                    if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', ''));
                    return fileType === type;
                });
                if (!isAccepted) return 'File type not accepted';
            }
            return null;
        };

        const updatePreviews = (file: File, currentPreviews: string[], setPreviews: React.Dispatch<React.SetStateAction<string[]>>): string[] => {
            if (!showPreview) return [];

            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviews(prev => [...prev, '']); // Add a placeholder for non-image/video files
            }
            return currentPreviews; // Previews will be updated asynchronously
        };

        const {
            inputRef,
            previews,
            setPreviews,
            handleDrag,
            handleDrop,
            handleFiles,
            ...logicProps
        } = useFileInputLogic(
            {
                ...props,
                defaultFileUrls, // Pass defaultFileUrls
                onChange: (value: string[] | null) => {
                    // This onChange is from FileInputLogicProps, we need to map it to File[]
                    if (value === null) {
                        onChange?.([]);
                    } else {
                        onChange?.(selectedFiles);
                    }
                },
                readOnly,
                setDragActive,
                selectedFiles,
                showPreview,
                maxSizeMB,
                accept: props.accept,
                maxFiles, // Pass maxFiles to useFileInputLogic
            },
            validateFile,
            updatePreviews
        );

        useImperativeHandle(ref, () => ({
            input: inputRef.current,
            reset: () => {
                setSelectedFiles([]);
                setPreviews(defaultFileUrls || []); // Use defaultFileUrls
                if (inputRef.current) inputRef.current.value = '';
                onChange?.([]);
            },
        }), [defaultFileUrls, onChange, inputRef, setPreviews]); // Use defaultFileUrls

        useEffect(() => {
            if (defaultFileUrls && defaultFileUrls.length > 0 && selectedFiles.length === 0) {
                setPreviews(defaultFileUrls); // Use defaultFileUrls
            } else if (!defaultFileUrls && selectedFiles.length === 0) {
                setPreviews([]);
            }
        }, [defaultFileUrls, selectedFiles]); // Use defaultFileUrls

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (readOnly) return;
            const files = Array.from(e.target.files || []);
            const newSelectedFiles: File[] = [];
            const newErrors: string[] = [];

            // Check maxFiles limit
            if (maxFiles && (selectedFiles.length + files.length > maxFiles)) {
                alert(`You can only upload a maximum of ${maxFiles} files.`);
                if (inputRef.current) inputRef.current.value = '';
                return;
            }

            files.forEach(file => {
                const error = validateFile(file);
                if (error) {
                    newErrors.push(error);
                } else {
                    newSelectedFiles.push(file);
                }
            });

            if (newErrors.length > 0) {
                alert(newErrors.join('\n'));
            }

            setSelectedFiles(prev => [...prev, ...newSelectedFiles]);
            onChange?.([...selectedFiles, ...newSelectedFiles]);

            newSelectedFiles.forEach(file => {
                if (showPreview && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
                    reader.readAsDataURL(file);
                } else {
                    setPreviews(prev => [...prev, '']); // Placeholder for non-image/video files
                }
            });
        };

        const handleRemoveFile = (index: number) => {
            if (readOnly) return;
            const updatedFiles = selectedFiles.filter((_, i) => i !== index);
            const updatedPreviews = previews.filter((_, i) => i !== index);
            setSelectedFiles(updatedFiles);
            setPreviews(updatedPreviews);
            if (inputRef.current) {
                const dt = new DataTransfer();
                updatedFiles.forEach(file => dt.items.add(file));
                inputRef.current.files = dt.files;
            }
            onChange?.(updatedFiles);
        };

        const hasContent = selectedFiles.length > 0 || previews.length > 0;

        if (readOnly && previews.length > 0) {
            return (
                <div className={className}>
                    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {previews.map((preview, index) => {
                            const isVideoPreview = selectedFiles[index]?.type.startsWith('video/');
                            return (
                                <div key={index}
                                     className="relative w-full h-32 rounded-lg border-2 border-gray-200 object-contain overflow-hidden">
                                    {preview ? (
                                        isVideoPreview ? (
                                            <video src={preview} controls className="w-full h-full object-contain"/>
                                        ) : (
                                            <Image src={preview} alt="Preview" fill objectFit="contain"
                                                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                                            />
                                        )
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-gray-100">
                                            <FileIcon className="w-8 h-8 text-gray-400"/>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div className={className}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div
                    className={clsx(
                        'relative border-2 border-dashed rounded-lg transition-all duration-200',
                        !readOnly && 'cursor-pointer',
                        dragActive && !readOnly && 'border-blue-500 bg-blue-50',
                        !dragActive && !error && !readOnly && 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-white',
                        error && 'border-red-300 bg-red-50',
                        (props.disabled || readOnly) && 'opacity-50 cursor-not-allowed'
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !props.disabled && !readOnly && inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                        disabled={props.disabled || readOnly}
                        multiple // Allow multiple file selection
                        {...props}
                    />

                    {!hasContent ? (
                        <div className="p-6 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400"/>
                            <p className="mt-2 text-sm text-gray-600">
                                <span
                                    className="font-semibold text-blue-600 hover:text-blue-500">Click to upload</span> or
                                drag and drop
                            </p>
                            {props.accept && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Accepted: {
                                    (() => {
                                        const acceptedList = props.accept.split(',').map(t => t.trim());
                                        const matchedGroups = Object.entries(BASE_MIMES)
                                            .filter(([_, mimes]) =>
                                                mimes.some(mime => acceptedList.includes(mime))
                                            )
                                            .map(([group]) => group);

                                        return matchedGroups.length > 0
                                            ? matchedGroups.join(', ')
                                            : props.accept;
                                    })()
                                }
                                </p>
                            )}
                            {maxSizeMB && <p className="text-xs text-gray-500">Max size: {maxSizeMB}MB</p>}
                            {maxFiles && <p className="text-xs text-gray-500">Max files: {maxFiles}</p>}
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedFiles.map((file, index) => (
                                <div key={file.name + index}
                                     className="flex items-start gap-3 p-2 border rounded-lg bg-white">
                                    {previews[index] ? (
                                        file.type.startsWith('video/') ? (
                                            <div
                                                className="w-16 h-16 flex-shrink-0 rounded border border-gray-200 overflow-hidden bg-gray-50">
                                                <video src={previews[index]} className="w-full h-full object-contain"/>
                                            </div>
                                        ) : (
                                            <div
                                                className="w-16 h-16 flex-shrink-0 rounded border border-gray-200 overflow-hidden bg-gray-50">
                                                <Image src={previews[index]}
                                                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                       alt="Preview" width={64} height={64}
                                                       className="w-full h-full object-contain"/>
                                            </div>
                                        )
                                    ) : (
                                        <div
                                            className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                                            <FileIcon className="w-6 h-6 text-gray-400"/>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                                    </div>
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile(index);
                                            }}
                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
                {error && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"/>
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

MultiFileInput.displayName = 'MultiFileInput';
