"use client";

import {useEffect, useRef, useCallback, HTMLProps} from "react";
import {useFloating, offset, flip, shift, autoUpdate, Placement} from "@floating-ui/react";
import ReactPortal from "@/components/shared/ReactPortal";

interface MenuProps extends HTMLProps<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    placement?: Placement;
    anchorRef: React.RefObject<Element | null>;
}

export default function MenuDropdown({
                                         isOpen,
                                         onClose,
                                         placement = 'bottom-end',
                                         children,
                                         className = "",
                                         anchorRef,
                                     }: MenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    const {refs, floatingStyles} = useFloating({
        elements: {
            reference: anchorRef.current ?? undefined,
        },
        placement: placement,
        middleware: [
            offset(8),
            flip(),
            shift(),
        ],
        whileElementsMounted: autoUpdate,
    });

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !anchorRef.current?.contains(event.target as Node)
            ) {
                onClose();
            }
        },
        [onClose, anchorRef]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleClickOutside, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <ReactPortal>
            <div
                ref={(el) => {
                    menuRef.current = el;
                    refs.setFloating(el);
                }}
                role="menu"
                style={floatingStyles}
                className={`overflow-hidden bg-background rounded-lg shadow-lg border border-gray-200 z-[100] ${className}`}
            >
                {children}
            </div>
        </ReactPortal>
    );
}
