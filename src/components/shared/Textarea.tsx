'use client';

import clsx from 'clsx';
import React, {
    forwardRef,
    TextareaHTMLAttributes,
    useEffect,
    useRef,
    useCallback,
    useState,
} from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    icon?: React.ReactNode;
    error?: string;
    readOnly?: boolean;
    showCounter?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            value = '',
            onChange,
            icon,
            placeholder,
            className,
            children,
            error,
            readOnly = false,
            maxLength,
            showCounter = true,
            rows = 3,
            ...props
        },
        ref
    ) => {
        const innerRef = useRef<HTMLTextAreaElement>(null);
        const [charCount, setCharCount] = useState((value as string)?.length || 0);
        const [isMultiLine, setIsMultiLine] = useState(false);

        // Forward ref
        useEffect(() => {
            if (!ref) return;
            if (typeof ref === 'function') ref(innerRef.current);
            else ref.current = innerRef.current;
        }, [ref]);

        // Auto-resize and multi-line detection
        const resize = useCallback(() => {
            const el = innerRef.current;
            if (!el) return;
            el.style.height = 'auto';
            const newHeight = el.scrollHeight + 2;
            el.style.height = `${newHeight}px`;
            el.style.overflowY = 'hidden';

            // Check if content exceeds single line height
            const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
            const isEffectivelyMultiLine = rows > 1 || newHeight > lineHeight * 1.5;
            setIsMultiLine(isEffectivelyMultiLine);
        }, [rows]);

        useEffect(() => {
            resize();
            setCharCount((value as string)?.length || 0);
        }, [value, resize]);

        const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const el = e.currentTarget;
            setCharCount(el.value.length);
            resize();
            onChange?.(e);
        };

        const hasIcon = !!icon;

        return (
            <div className="w-full flex flex-col">
                <div className="relative w-full">
                    {hasIcon && (
                        <div className="absolute top-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                            {icon}
                        </div>
                    )}

                    <textarea
                        ref={innerRef}
                        value={value}
                        onInput={handleInput}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        maxLength={maxLength}
                        rows={rows}
                        className={clsx(
                            'block text-base w-full py-3 border rounded-lg outline-none transition-[border-color,background-color] duration-200 resize-none scrollbar-beautiful',
                            hasIcon ? 'pl-10 pr-3' : 'px-3',
                            error
                                ? 'border-red-300 focus:border-error-500 bg-error-50'
                                : readOnly
                                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-auto'
                                    : 'border-gray-300 focus:border-primary-500 bg-gray-50 hover:bg-white',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${props.id}-error` : undefined}
                        {...props}
                    />

                    {maxLength && showCounter && (
                        <div
                            className={clsx(
                                'absolute text-xs text-gray-400 select-none pointer-events-none',
                                isMultiLine
                                    ? 'bottom-2 right-2'
                                    : 'top-1/2 right-3 transform -translate-y-1/2'
                            )}
                        >
                            {charCount}/{maxLength}
                        </div>
                    )}

                    {children}
                </div>

                {/* Error message */}
                {error && (
                    <div className="mt-1 text-xs">
                        <p
                            id={`${props.id}-error`}
                            className="flex items-center gap-1 text-error-500"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {error}
                        </p>
                    </div>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
export default Textarea;