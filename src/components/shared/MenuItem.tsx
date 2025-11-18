'use client';

import React from "react";
import Link from "next/link";

interface MenuItemProps {
    label: string;
    icon?: React.ElementType;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    href?: string;
}

export default function MenuItem({
                                     label,
                                     icon: Icon,
                                     onClick,
                                     className,
                                     disabled,
                                     href
                                 }: MenuItemProps) {
    const baseClasses = `flex items-center gap-3 px-4 py-3 w-full text-left transition-colors 
        hover:bg-gray-50 hover:text-primary-500 cursor-pointer 
        disabled:cursor-default disabled:opacity-50 ${className ?? ''}`;

    if (href && !disabled) {
        return (
            <Link href={href} className={baseClasses} onClick={onClick} prefetch>
                {Icon && <Icon className="w-5 h-5 text-inherit"/>}
                <span>{label}</span>
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={baseClasses}
        >
            {Icon && <Icon className="w-5 h-5 text-inherit"/>}
            <span>{label}</span>
        </button>
    );
}
