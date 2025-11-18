'use client';

import {HTMLProps, ReactNode, useEffect, useRef} from 'react';
import ReactPortal from '@/components/shared/ReactPortal';
import clsx from 'clsx';

interface ModalProps extends HTMLProps<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    backdropClassName?: string;
    closeOnBackdropClick?: boolean;
}

export default function Modal({
                                  isOpen,
                                  onClose,
                                  children,
                                  className = '',
                                  backdropClassName = 'bg-black bg-opacity-30',
                                  closeOnBackdropClick = true,
                                  ...props
                              }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    /** --- Prevent scroll using event listeners --- */
    if (!isOpen) return null;

    return (
        <ReactPortal>
            <div
                className={clsx('fixed inset-0 z-30 flex items-center justify-center', backdropClassName)}
                onMouseDown={(e) => {
                    if (!closeOnBackdropClick) return;
                    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                        onClose();
                    }
                }}
                {...props}
            >
                <div
                    ref={modalRef}
                    className={clsx('bg-background z-40 outline-none', className)}
                    tabIndex={-1}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </ReactPortal>
    );
}
