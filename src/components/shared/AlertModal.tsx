'use client';

import {ReactNode} from "react";
import {AlertTriangle, CheckCircle2, Info, XCircle} from "lucide-react";
import Modal from "@/components/shared/Modal";
import clsx from "clsx";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    type?: "info" | "success" | "warning" | "error" | "confirm";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    children?: ReactNode;
}

export default function AlertModal({
                                       isOpen,
                                       onClose,
                                       title = "Notification",
                                       description,
                                       type = "info",
                                       confirmText = "OK",
                                       cancelText = "Cancel",
                                       onConfirm,
                                       showCancel = false,
                                       children,
                                   }: AlertModalProps) {
    const iconMap = {
        info: <Info className="w-6 h-6 text-blue-600 animate-pulse"/>,
        success: <CheckCircle2 className="w-6 h-6 text-green-600 animate-pulse"/>,
        warning: <AlertTriangle className="w-6 h-6 text-yellow-600 animate-pulse"/>,
        error: <XCircle className="w-6 h-6 text-red-600 animate-pulse"/>,
        confirm: <AlertTriangle className="w-6 h-6 text-orange-600 animate-pulse"/>,
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full max-w-md rounded-xl shadow-lg p-6 bg-white transition-all duration-300"
            backdropClassName="bg-black/50 flex items-center justify-center transition-opacity duration-300"
        >
            <div className="flex flex-col items-center text-center space-y-2">
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
                    {iconMap[type]}
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

                {/* Description */}
                {description && (
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{description}</p>
                )}

                {/* Optional children */}
                {children && <div className="w-full text-gray-600 text-sm">{children}</div>}

                {/* Action buttons */}
                <div className="flex w-full gap-3 mt-4">
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className="btn btn-soft flex-1 py-2.5 px-3 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            aria-label="Cancel action"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onConfirm?.();
                            onClose();
                        }}
                        className={clsx(
                            "btn btn-soft flex-1 py-2.5 px-3 rounded-md text-sm font-medium text-white transition-colors duration-200",
                            type === "error" && "bg-red-600 hover:bg-red-700",
                            type === "warning" && "bg-yellow-600 hover:bg-yellow-700",
                            type === "confirm" && "bg-orange-600 hover:bg-orange-700",
                            type === "success" && "bg-green-600 hover:bg-green-700",
                            type === "info" && "bg-blue-600 hover:bg-blue-700"
                        )}
                        aria-label="Confirm action"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}