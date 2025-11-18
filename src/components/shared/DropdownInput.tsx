'use client';

import {useState, useRef, HTMLProps, useEffect} from "react";
import clsx from "clsx";
import {ChevronDown} from "lucide-react";
import Input from "@/components/shared/Input";
import MenuDropdown from "./MenuDropdown";
import {error} from "next/dist/build/output/log";

interface Option {
    label: string;
    value: string;
}

interface DropdownInputProps
    extends Omit<HTMLProps<HTMLInputElement>, "value" | "onChange"> {
    options: Option[];
    value?: Option | null;
    onChange?: (value: Option) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    readOnly?: boolean;
    error?: string;
}

export default function DropdownInput({
                                          options,
                                          value,
                                          onChange,
                                          placeholder = "Select...",
                                          className,
                                          icon,
                                          error,
                                          readOnly = false,
                                          ...props
                                      }: DropdownInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleToggle = () => {
        if (readOnly) return;
        setIsOpen((prev) => !prev);
    };

    const handleClose = () => setIsOpen(false);

    const handleSelect = (option: Option) => {
        if (readOnly) return;
        onChange?.(option);
        handleClose();
    };

    return (
        <div className="relative w-full">
            <Input
                leftIcon={icon}
                rightIcon={<ChevronDown className="w-4 h-4"/>}
                type="text"
                ref={inputRef}
                readOnly={readOnly}
                editable={true}
                value={value?.label || ""}
                onChange={() => {
                }}
                onClick={handleToggle}
                placeholder={placeholder}
                className={clsx(className, !readOnly ? 'cursor-pointer' : 'cursor-default')}
                error={error}
                {...props}
            />


            {!readOnly && (
                <MenuDropdown
                    isOpen={isOpen}
                    onClose={handleClose}
                    anchorRef={inputRef}
                >
                    <ul
                        className="max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                        style={{width: inputRef.current?.offsetWidth}}
                    >
                        {options.length > 0 ? (
                            options.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                >
                                    {option.label}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-gray-400">No options</li>
                        )}
                    </ul>
                </MenuDropdown>
            )}
        </div>
    );
}
