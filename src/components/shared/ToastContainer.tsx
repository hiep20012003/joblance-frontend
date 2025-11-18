// src/buyer/ToastContainer.tsx
'use client';

import {AnimatePresence} from 'framer-motion';
import React from 'react';
import ReactPortal from './ReactPortal';
import ToastItem from './ToastItem';
import {useToast} from '@/context/ToastContext';
import clsx from "clsx";

export default function ToastContainer() {
    const {toasts} = useToast();

    return (
        <ReactPortal>
            <div
                className={clsx("fixed top-8 right-6 z-50 flex flex-col gap-3")}
                role="region"
                aria-live="polite"
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            id={toast.id}
                            type={toast.type}
                            message={toast.message}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ReactPortal>
    );
}