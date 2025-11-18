// components/SingleFileInput.tsx
'use client';

import {forwardRef, useState, useImperativeHandle, ChangeEvent, useEffect} from 'react';
import {FileInputBaseProps, useFileInputLogic} from '@/lib/hooks/useFileInputLogic';
import clsx from 'clsx';
import {Upload, X, File as FileIcon} from 'lucide-react'; // Renamed File to FileIcon to avoid conflict
import Image from 'next/image';
import {BASE_MIMES} from "@/lib/constants/constant";
import {formatFileSize} from "@/lib/utils/helper";

export interface SingleFileInputProps extends FileInputBaseProps {
    defaultFileUrl?: string; // Changed from defaultImageUrl
    onChange?: (file: File | null) => void;
}

export const SingleFileInput = forwardRef<{ input: HTMLInputElement | null; reset: () => void }, SingleFileInputProps>(
    ({
         error,
         label,
         helperText,
         className,
         showPreview = true,
         maxSizeMB = 10,
         defaultFileUrl, // Changed from defaultImageUrl
         readOnly = false,
         onChange,
         ...props
     }, ref) => {
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
                    setPreviews([reader.result as string]);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviews([]); // Clear preview for non-image/video files
            }
            return currentPreviews; // Return currentPreviews as the state update is asynchronous
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
                defaultFileUrl, // Pass defaultFileUrl
                onChange: (value: string | null) => {
                    // This onChange is from FileInputLogicProps, we need to map it to File | null
                    if (value === null) {
                        onChange?.(null);
                    } else if (selectedFile) {
                        onChange?.(selectedFile);
                    }
                },
                readOnly,
                setDragActive,
                selectedFiles: selectedFile ? [selectedFile] : [],
                showPreview,
                maxSizeMB,
                accept: props.accept,
            },
            validateFile,
            updatePreviews
        );

        useImperativeHandle(ref, () => ({
            input: inputRef.current,
            reset: () => {
                setSelectedFile(null);
                setPreviews(defaultFileUrl ? [defaultFileUrl] : []); // Use defaultFileUrl
                if (inputRef.current) inputRef.current.value = '';
                onChange?.(null);
            },
        }), [defaultFileUrl, onChange, inputRef, setPreviews]); // Use defaultFileUrl

        useEffect(() => {
            if (defaultFileUrl && !selectedFile) {
                setPreviews([defaultFileUrl]); // Use defaultFileUrl
            } else if (!defaultFileUrl && !selectedFile) {
                setPreviews([]);
            }
        }, [defaultFileUrl, selectedFile]); // Use defaultFileUrl


        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (readOnly) return;
            const file = e.target.files?.[0] || null;
            if (file) {
                const error = validateFile(file);
                if (!error) {
                    setSelectedFile(file);
                    onChange?.(file);
                    if (showPreview && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                        const reader = new FileReader();
                        reader.onloadend = () => setPreviews([reader.result as string]);
                        reader.readAsDataURL(file);
                    } else {
                        setPreviews([]);
                    }
                } else {
                    alert(error);
                    setSelectedFile(null);
                    onChange?.(null);
                    if (inputRef.current) inputRef.current.value = '';
                    setPreviews(defaultFileUrl ? [defaultFileUrl] : []); // Use defaultFileUrl
                }
            } else {
                setSelectedFile(null);
                onChange?.(null);
                setPreviews(defaultFileUrl ? [defaultFileUrl] : []); // Use defaultFileUrl
            }
        };

        const handleClear = () => {
            if (readOnly) return;
            setSelectedFile(null);
            setPreviews(defaultFileUrl ? [defaultFileUrl] : []); // Use defaultFileUrl
            if (inputRef.current) inputRef.current.value = '';
            onChange?.(null);
        };

        const hasContent = selectedFile || previews.length > 0;
        const isVideoPreview = previews[0] && selectedFile?.type.startsWith('video/');

        if (readOnly && previews.length > 0) {
            return (
                <div className={className}>
                    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
                    {isVideoPreview ? (
                        <video src={previews[0]} controls
                               className="max-w-xs max-h-64 rounded-lg border-2 border-gray-200 object-contain"/>
                    ) : (
                        <Image
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            src={previews[0]} alt="Preview" width={256} height={256}
                            className="max-w-xs max-h-64 rounded-lg border-2 border-gray-200 object-contain"/>
                    )}
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
                        </div>
                    ) : (
                        <div className="p-4 flex items-start gap-3">
                            {previews[0] ? (
                                isVideoPreview ? (
                                    <div
                                        className="w-24 h-24 flex-shrink-0 rounded border border-gray-200 overflow-hidden bg-gray-50">
                                        <video src={previews[0]} className="w-full h-full object-contain"/>
                                    </div>
                                ) : (
                                    <div
                                        className="w-24 h-24 flex-shrink-0 rounded border border-gray-200 overflow-hidden bg-gray-50">
                                        <Image
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            src={previews[0]} alt="Preview" width={96} height={96}
                                            className="w-full h-full object-contain"/>
                                    </div>
                                )
                            ) : (
                                <div
                                    className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                                    <FileIcon className="w-8 h-8 text-gray-400"/>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile?.name || 'Current image'}</p>
                                {selectedFile &&
                                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>}
                            </div>
                            {!readOnly && selectedFile?.name && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear();
                                    }}
                                    className="btn btn-soft flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                                >
                                    <X className="w-5 h-5"/>
                                </button>
                            )}
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

SingleFileInput.displayName = 'SingleFileInput';
