import clsx from 'clsx';
import React, {forwardRef, InputHTMLAttributes} from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
    readOnly?: boolean;
    editable?: boolean;
    containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            value,
            onChange,
            leftIcon,
            rightIcon,
            placeholder,
            className,
            containerClassName,
            children,
            error,
            editable = false,
            readOnly = false,
            type = 'text',
            ...props
        },
        ref
    ) => {
        const hasLeftIcon = !!leftIcon;
        const hasRightIcon = !!rightIcon;

        return (
            <div className="w-full">
                <div className={clsx("relative w-full", containerClassName)}>
                    {hasLeftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        type={type}
                        ref={ref}
                        value={value} // Ensure empty string is used if value is undefined
                        onChange={onChange}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        className={clsx(
                            'text-base w-full py-3 border rounded-lg outline-none transition-[border-color,background-color] duration-200',
                            hasLeftIcon && hasRightIcon
                                ? 'pl-10 pr-10'
                                : hasLeftIcon
                                    ? 'pl-10 pr-3'
                                    : hasRightIcon
                                        ? 'pl-3 pr-10'
                                        : 'px-3',
                            error
                                ? 'border-red-300 focus:border-error-500 bg-error-50'
                                : readOnly
                                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-auto'
                                    : 'border-gray-300 focus:border-primary-500 bg-gray-50',
                            editable ? 'caret-transparent' : '',
                            className
                        )}
                        {...props}
                    />

                    {hasRightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {rightIcon}
                        </div>
                    )}

                    {children}
                </div>

                {error && (
                    <p
                        id={`${props.id}-error`}
                        className="text-error-500 text-xs mt-1 flex items-center gap-1"
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
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;