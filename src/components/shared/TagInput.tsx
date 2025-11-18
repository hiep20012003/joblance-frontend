'use client';

import clsx from 'clsx';
import {forwardRef, useState, KeyboardEvent, InputHTMLAttributes} from 'react';
import {XIcon} from 'lucide-react';

export interface TagInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    icon?: React.ReactNode;
    error?: string;
    tags: string[];
    onChangeTags: (tags: string[]) => void;
    placeholder?: string;
    readOnly?: boolean;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
    (
        {
            tags,
            onChangeTags,
            icon,
            placeholder,
            className,
            error,
            readOnly = false,
            ...props
        }: TagInputProps,
        ref
    ) => {
        const [inputValue, setInputValue] = useState('');

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (readOnly) return;
            if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault();
                const newTag = inputValue.trim();
                if (!tags.includes(newTag)) onChangeTags([...tags, newTag]);
                setInputValue('');
            } else if (e.key === 'Backspace' && !inputValue) {
                onChangeTags(tags.slice(0, -1));
            }
        };

        const handleRemoveTag = (index: number) => {
            if (readOnly) return;
            const updated = [...tags];
            updated.splice(index, 1);
            onChangeTags(updated);
        };

        return (
            <div className="w-full">
                <div
                    className={clsx(
                        'flex flex-wrap items-center gap-2 p-3 border rounded-lg transition-all duration-200',
                        error
                            ? 'border-red-300 focus-within:border-error-500 bg-error-50'
                            : readOnly
                                ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-auto'
                                : 'border-gray-300 focus-within:border-primary-500 bg-gray-50 hover:bg-white',
                    )}
                >
                    {icon && (
                        <div className="pl-1 flex items-center pointer-events-none">
                            {icon}
                        </div>
                    )}

                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className={clsx(
                                'flex items-center rounded-full px-3 py-1 text-sm',
                                readOnly ? 'bg-gray-200 text-gray-500' : 'bg-gray-200'
                            )}
                        >
              {tag}
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(index)}
                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            )}
            </span>
                    ))}

                    {!readOnly && (
                        <input
                            ref={ref}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={clsx("flex-1 min-w-[120px] border-none outline-none focus:ring-0 bg-transparent text-base", className)}
                            {...props}
                        />
                    )}
                </div>

                {error && (
                    <p className="text-error-500 text-sm mt-1 flex items-center gap-1">
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

TagInput.displayName = 'TagInput';
export default TagInput;
