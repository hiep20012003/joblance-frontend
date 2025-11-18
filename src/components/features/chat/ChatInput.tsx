// components/ChatInput.tsx
'use client';

import {forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback} from 'react';
import {SendHorizontal, Paperclip, X, File as FileIcon} from 'lucide-react'; // Added FileIcon
import clsx from 'clsx';
import {useFileInputLogic} from '@/lib/hooks/useFileInputLogic';
import Image from 'next/image'; // Added Image import
import {BASE_MIMES, CHAT_FILE_ALLOWED_MIMES} from "@/lib/constants/constant";
import {formatFileSize} from "@/lib/utils/helper"; // Import the hook and utility

export interface ChatInputRef {
    reset: () => void;
    focus: () => void;
}

export type SendMessagePayload = { type: 'text'; content: string } | { type: 'file'; file: File };

interface ChatInputProps {
    onSend: (payload: SendMessagePayload) => void;
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
    ({onSend, placeholder = "Type a message...", rows = 1, disabled}, ref) => {
        const [mode, setMode] = useState<'text' | 'file'>('text');
        const [text, setText] = useState('');
        const [file, setFile] = useState<File | null>(null);
        const [dragActive, setDragActive] = useState(false);
        const [previews, setPreviews] = useState<string[]>([]);

        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const MAX_FILE_SIZE_MB = 50;
        const ACCEPTED_FILE_TYPES = Object.values(CHAT_FILE_ALLOWED_MIMES)
            .flat()
            .join(',');

        const validateFile = useCallback((file: File): string | null => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                return `File ${file.name} exceeds the maximum size of ${MAX_FILE_SIZE_MB}MB.`;
            }
            if (ACCEPTED_FILE_TYPES) {
                const acceptedTypes = ACCEPTED_FILE_TYPES.split(',').map(t => t.trim());
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
        }, []);

        const updatePreviews = useCallback((f: File, currentPreviews: string[], setPreviewsState: React.Dispatch<React.SetStateAction<string[]>>): string[] => {
            if (currentPreviews.length > 0) {
                URL.revokeObjectURL(currentPreviews[0]); // Revoke previous URL for single file
            }

            if (f.type.startsWith('image/') || f.type.startsWith('video/')) {
                const newPreview = URL.createObjectURL(f);
                setPreviewsState([newPreview]);
                return [newPreview];
            } else {
                setPreviewsState([]);
                return [];
            }
        }, []);

        const {
            inputRef,
            handleDrag,
            handleDrop: handleFileInputDrop, // Rename to avoid conflict
        } = useFileInputLogic(
            {
                maxSizeMB: MAX_FILE_SIZE_MB,
                accept: ACCEPTED_FILE_TYPES,
                setDragActive: setDragActive,
                showPreview: true,
            },
            validateFile,
            updatePreviews
        );

        useEffect(() => {
        }, [previews]);

        useEffect(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }, [text]);

        useImperativeHandle(ref, () => ({
            reset: () => {
                setMode('text');
                setText('');
                setFile(null);
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
                setPreviews([]);
                setTimeout(() => textareaRef.current?.focus(), 0);
            },
            focus: () => textareaRef.current?.focus(),
        }));

        const handleFileSelected = (files: FileList | null) => {
            if (files && files.length > 0) {
                const selectedFile = files[0];
                const error = validateFile(selectedFile);
                if (!error) {
                    setFile(selectedFile);
                    setMode('file');
                    // Directly call updatePreviews to set local previews state
                    updatePreviews(selectedFile, previews, setPreviews);
                } else {
                    alert(error);
                    if (inputRef.current) {
                        inputRef.current.value = ''; // Clear the input if there's an error
                    }
                    setFile(null); // Clear selected file on error
                    setPreviews([]); // Clear previews on error
                }
            }
        };

        const handleClearFile = () => {
            setFile(null);
            setMode('text');
            if (inputRef.current) {
                inputRef.current.value = ''; // Clear the file input
            }
            setPreviews([]); // Clear any generated previews
            setTimeout(() => textareaRef.current?.focus(), 0);
        };

        const handleSend = () => {
            if (mode === 'text' && text.trim()) {
                onSend({type: 'text', content: text.trim()});
                setText('');
            } else if (mode === 'file' && file) {
                onSend({type: 'file', file: file});
                handleClearFile();
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        };

        return (
            <div
                className="flex items-stretch gap-2 p-4 bg-white shadow-[0_-2px_4px_0px_rgba(0,0,0,0.03)]"> {/* Main container for 3 sections */}
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={inputRef}
                    onChange={(e) => handleFileSelected(e.target.files)}
                    accept={ACCEPTED_FILE_TYPES}
                    className="hidden"
                />

                {/* Left Section: File Attachment Button */}
                <div className={'flex items-end justify-center gap-2 mb-1.5'}>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled}
                        className="btn btn-soft p-2 hover:bg-gray-200 rounded-full transition flex-shrink-0"
                    >
                        <Paperclip size={20} className="text-gray-600"/>
                    </button>
                </div>

                {/* Middle Section: Chat Input / File Preview */}
                <div
                    className={clsx(
                        'relative flex-grow rounded-2xl',
                        mode === 'text'
                            ? 'bg-gray-100'
                            : 'bg-blue-50',
                        dragActive && 'bg-blue-100'
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => {
                        handleFileInputDrop(e);
                        handleFileSelected(e.dataTransfer.files);
                    }}
                >
                    {/* CHẾ ĐỘ TEXT */}
                    {mode === 'text' && (
                        <div className="flex items-center gap-3 p-3 pr-1">
                          <textarea
                              name={'message'}
                              ref={textareaRef}
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder={placeholder}
                              disabled={disabled}
                              rows={rows}
                              className="flex-1 resize-none bg-transparent text-gray-800 placeholder-gray-500 max-h-48 overflow-y-auto outline-0 scrollbar-beautiful"
                              style={{scrollbarWidth: 'thin'}}
                          />
                        </div>
                    )}

                    {/* CHẾ ĐỘ FILE */}
                    {mode === 'file' && file && (
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                {previews[0] ? (
                                    file.type.startsWith('video/') ? (
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
                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                                </div>

                                <button
                                    onClick={handleClearFile}
                                    className="p-2 hover:bg-red-100 rounded-full transition text-red-600 flex-shrink-0"
                                >
                                    <X size={20}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Section: Send Button */}
                <div className={'flex items-end justify-center gap-2 mb-1.5'}>
                    <button
                        onClick={handleSend}
                        disabled={(!text.trim() && !file) || disabled} // Disable if no text and no file
                        className={clsx(
                            'btn btn-soft p-2 rounded-full transition flex-shrink-0', // Reverted p-3 to p-2.5
                            (text.trim() || file)
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        )}
                    >
                        <SendHorizontal size={20}/>
                    </button>
                </div>
            </div>
        );
    }
);

ChatInput.displayName = 'ChatInput';
