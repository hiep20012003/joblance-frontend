import React, {ReactNode, useRef, useEffect, useState} from "react";

interface SkeletonWrapperProps {
    loading: boolean;
    children: ReactNode;
    className?: string;
}

export default function SkeletonWrapper({loading, children, className = ""}: SkeletonWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setSize({width: rect.width, height: rect.height});
        }
    }, [children, loading]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {loading && size && (
                <div
                    className="absolute top-0 left-0 bg-gray-200 rounded-md animate-pulse"
                    style={{width: size.width, height: size.height}}
                />
            )}
            <div style={{visibility: loading ? "hidden" : "visible"}}>{children}</div>
        </div>
    );
}
