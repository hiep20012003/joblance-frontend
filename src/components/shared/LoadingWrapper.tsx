'use client';

import {HTMLProps, ReactNode, useEffect, useState} from "react";
import clsx from "clsx";
import {createPortal} from "react-dom";
import Spinner from "@/components/shared/Spinner";

interface LoadingWrapperProps extends HTMLProps<HTMLDivElement> {
    isLoading: boolean;
    children?: ReactNode;
    spinner?: ReactNode;
    className?: string;
    overlayClassName?: string;
    zIndex?: number;
    fullScreen?: boolean; // overlay phủ toàn viewport
    backgroundTransparent?: boolean; // overlay trong suốt
    hideSpinner?: boolean; // ẩn spinner
}

export default function LoadingWrapper({
                                           isLoading,
                                           children,
                                           spinner,
                                           className,
                                           overlayClassName,
                                           zIndex = 50,
                                           fullScreen = false,
                                           backgroundTransparent = false,
                                           hideSpinner = false,
                                           ...props
                                       }: LoadingWrapperProps) {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    /** Tạo container portal khi fullScreen */
    useEffect(() => {
        if (fullScreen) {
            let el = document.getElementById("loading-portal-root");
            if (!el) {
                el = document.createElement("div");
                el.id = "loading-portal-root";
                document.body.appendChild(el);
            }
            setPortalContainer(el);
        }
    }, [fullScreen]);

    /** Overlay hiển thị khi loading */
    const overlay = (
        <div
            className={clsx(
                "flex justify-center items-center select-none",
                backgroundTransparent ? "bg-transparent" : "bg-black/20 backdrop-blur-sm",
                fullScreen ? "fixed inset-0" : "absolute inset-0",
                "pointer-events-auto",
                overlayClassName
            )}
            style={{zIndex}}
            onClick={(e) => e.stopPropagation()}
        >
            {hideSpinner
                ? null
                : spinner ?? (
                // <div className="flex items-center gap-3 text-gray-600 text-lg">
                <Spinner/>
                // </div>
            )}
        </div>
    );


    return (
        <div className={clsx("relative", className)} {...props}>
            {children}
            {isLoading &&
                (fullScreen && portalContainer
                    ? createPortal(overlay, portalContainer)
                    : overlay)}
        </div>
    );
}
