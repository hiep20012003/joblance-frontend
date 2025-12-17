// components/FileInputBase.tsx
'use client';

import {useRef, useState, useEffect} from 'react';

export interface FileInputBaseProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'defaultValue'> {
    error?: string;
    label?: string;
    helperText?: string;
    showPreview?: boolean;
    maxSizeMB?: number;
    readOnly?: boolean;
    accept?: string;
}

export interface FileInputLogicProps<T> {
    defaultValue?: T;
    onChange?: (value: T) => void;
    setDragActive?: (active: boolean) => void;
    selectedFiles?: File[];
    maxFiles?: number;
    defaultFileUrl?: string;
    defaultFileUrls?: string[];
}

export const useFileInputLogic = <T>(
    props: FileInputBaseProps & FileInputLogicProps<T>,
    validateFile: (file: File) => string | null,
    updatePreviews: (
        file: File,
        currentPreviews: string[],
        setPreviews: React.Dispatch<React.SetStateAction<string[]>>
    ) => string[]
) => {
    const {
        maxSizeMB = 10,
        showPreview = true,
        readOnly = false,
        onChange,
        defaultValue,
        accept,
        setDragActive,
        selectedFiles,
        maxFiles,
        ...rest
    } = props;


    const [previews, setPreviews] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // 🔹 Initialize previews based on defaultValue
    useEffect(() => {
        if (defaultValue) {
            if (Array.isArray(defaultValue)) {
                setPreviews(defaultValue.filter(Boolean) as string[]);
            } else if (typeof defaultValue === 'string') {
                setPreviews([defaultValue]);
            }
        } else {
            setPreviews([]);
        }
    }, [defaultValue]);

    const handleFiles = (files: FileList | null) => {
        if (readOnly || !files) return;

        const newErrors: string[] = [];
        const filesToProcess = Array.from(files);

        filesToProcess.forEach(file => {
            const error = validateFile(file);
            if (error) {
                newErrors.push(error);
            } else {
                updatePreviews(file, previews, setPreviews);
            }
        });

        if (newErrors.length > 0) {
            alert(newErrors.join('\n'));
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        const active = e.type === 'dragenter' || e.type === 'dragover';
        setDragActive?.(active);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setDragActive?.(false);
        handleFiles(e.dataTransfer.files);


        if (inputRef.current && e.dataTransfer.files) {
            const dt = new DataTransfer();
            Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
            inputRef.current.files = dt.files;
        }
    };

    return {
        inputRef,
        previews,
        setPreviews,
        handleDrag,
        handleDrop,
        handleFiles,
        maxSizeMB,
        showPreview,
        readOnly,
        onChange,
        accept,
        ...rest
    };
};
