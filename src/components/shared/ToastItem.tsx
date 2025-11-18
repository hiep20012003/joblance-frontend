'use client';

import {motion} from 'framer-motion';
import React, {JSX, useEffect} from 'react';
import {useToast} from '@/context/ToastContext';
import {CheckCircle, XCircle, Info, AlertTriangle, Bell} from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'notification';

const toastStyles: Record<ToastType, string> = {
    success: 'bg-success-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
    warning: 'bg-warning-500',
    notification: 'bg-gray-100 text-gray-800! border-gray-200',
};

const toastIcons: Record<ToastType, JSX.Element> = {
    success: <CheckCircle className="w-5 h-5 text-white"/>,
    error: <XCircle className="w-5 h-5 text-white"/>,
    info: <Info className="w-5 h-5 text-white"/>,
    warning: <AlertTriangle className="w-5 h-5 text-white"/>,
    notification: <Bell className="w-5 h-5 text-gray-800"/>,
};

export default function ToastItem({
                                      id,
                                      type,
                                      message,
                                      duration = 4000,
                                  }: {
    id: string;
    type: ToastType;
    message: string | React.ReactNode;
    duration?: number;
}) {
    const {removeToast} = useToast();

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, removeToast]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeToast(id);
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 30}}
            transition={{duration: 0.25}}
            className={`relative max-w-100 px-4 py-3 rounded-lg shadow-lg text-white cursor-pointer select-none overflow-hidden ${toastStyles[type]}`}
            onClick={handleClick}
            role="alert"
        >
            <div className="flex items-center gap-3">
                {toastIcons[type]}
                {typeof message === 'string' ? (
                    <span className="flex-1 text-sm font-medium">{message}</span>
                ) : message}
            </div>

            {type !== 'notification' && (
                <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full overflow-hidden">
                    <div
                        className="h-1 bg-white animate-progress"
                        style={{animationDuration: `${duration}ms`}}
                    />
                </div>
            )}

        </motion.div>
    );
}