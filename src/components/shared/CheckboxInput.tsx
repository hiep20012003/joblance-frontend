'use client';

import clsx from "clsx";
import {forwardRef, InputHTMLAttributes, useEffect, useRef} from "react";
import {CheckIcon, MinusIcon} from "lucide-react";

export interface CheckboxInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: React.ReactNode;
    error?: string;
    icon?: React.ReactNode;
    indeterminate?: boolean;
    readOnly?: boolean; // ✅ Thêm hỗ trợ readonly
}

const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
    (
        {
            label,
            error,
            icon,
            indeterminate = false,
            className,
            disabled,
            readOnly = false,
            ...props
        },
        ref
    ) => {
        const internalRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (internalRef.current) {
                internalRef.current.indeterminate = indeterminate;
            }
        }, [indeterminate]);

        const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
            if (readOnly) e.preventDefault();
        };

        return (
            <div className="flex flex-col gap-1.5 w-fit">
                <label
                    className={clsx(
                        "relative flex items-center gap-2 select-none group",
                        (disabled || readOnly) ? "opacity-60 cursor-auto" : "cursor-pointer"
                        , className)}
                >
                    <div className="relative flex items-center justify-center">
                        <input
                            ref={(node) => {
                                if (typeof ref === "function") ref(node);
                                else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
                                internalRef.current = node;
                            }}
                            type="checkbox"
                            disabled={disabled}
                            onClick={handleClick}
                            onFocus={(e) => readOnly && e.target.blur()}
                            tabIndex={readOnly ? -1 : 0}
                            className={clsx(
                                "peer appearance-none w-5 h-5 border-2 rounded transition-all duration-200",
                                "focus:outline-none",
                                error
                                    ? "border-red-400 bg-red-50 checked:bg-red-500 checked:border-red-500 focus:ring-red-200"
                                    : "border-gray-300 bg-white checked:bg-primary-500 checked:border-primary-500 hover:border-primary-400 focus:ring-primary-200",
                                (disabled || readOnly) && "hover:border-gray-300 focus:ring-0",
                                className
                            )}
                            {...props}
                        />

                        {/* Custom icon: Check hoặc Minus */}
                        <span
                            className={clsx(
                                "absolute inset-0 flex items-center justify-center pointer-events-none text-white",
                                "peer-checked:scale-100 peer-checked:opacity-100 scale-50 opacity-0",
                                "transition-all duration-200 ease-out"
                            )}
                        >
              {indeterminate ? (
                  <MinusIcon className="w-3.5 h-3.5" strokeWidth={3}/>
              ) : (
                  icon || <CheckIcon className="w-3.5 h-3.5" strokeWidth={3}/>
              )}
            </span>
                    </div>

                    {label}
                </label>

                {error && (
                    <div className="flex items-start gap-1.5 ml-8">
                        <svg
                            className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-red-600 text-xs leading-tight">{error}</p>
                    </div>
                )}
            </div>
        );
    }
);

CheckboxInput.displayName = "CheckboxInput";

export default CheckboxInput;
