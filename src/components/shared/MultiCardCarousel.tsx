'use client';

import React, {useRef, useCallback, useEffect, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";

interface MultiCardCarouselProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    visibleCount?: number;
    gap?: number;
    manualScroll?: boolean;
    className?: string;

    showExplore?: boolean;
    onExploreClick?: () => void;
    exploreLabel?: string;
}

export const MultiCardCarousel: React.FC<MultiCardCarouselProps> = ({
                                                                        className,
                                                                        items,
                                                                        renderItem,
                                                                        visibleCount = 4,
                                                                        gap = 16,
                                                                        manualScroll = true,
                                                                        showExplore = false,
                                                                        onExploreClick,
                                                                        exploreLabel = "Explore All →",
                                                                    }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const getCardWidth = useCallback(() => {
        if (!containerRef.current) return 0;
        const containerWidth = containerRef.current.clientWidth;
        return (containerWidth - gap * (visibleCount - 1)) / visibleCount;
    }, [visibleCount, gap]);

    const scroll = useCallback(
        (direction: "left" | "right") => {
            if (!containerRef.current) return;
            const cardWidth = getCardWidth() + gap;
            const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

            containerRef.current.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            });
        },
        [getCardWidth, gap]
    );

    const updateScrollButtons = useCallback(() => {
        if (!containerRef.current) return;
        const {scrollLeft, scrollWidth, clientWidth} = containerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const tolerance = 2;

        setCanScrollLeft(scrollLeft > tolerance);
        setCanScrollRight(scrollLeft < maxScroll - tolerance);
    }, []);

    const blockScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (!manualScroll) e.preventDefault();
        },
        [manualScroll]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => updateScrollButtons();
        const handleResize = () => {
            updateScrollButtons();
            container.style.setProperty("--card-gap", `${gap}px`);
        };

        handleResize();
        container.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, [items.length, visibleCount, gap, updateScrollButtons]);

    const containerClasses = `
    flex overflow-x-auto scroll-smooth
    ${manualScroll ? "scrollbar-hide" : "scrollbar-visible"}
    ${!manualScroll ? "cursor-default" : ""} ${className ?? ''}
  `.trim();

    return (
        <div className="relative w-full group">
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full
                          bg-white text-gray-900 transition-all duration-500 ease-out
                          opacity-0 -translate-x-[50%] group-hover:opacity-100 group-hover:translate-x-[-50%]
                          pointer-events-auto cursor-pointer aspect-square flex items-center justify-center shadow-md"
                    style={{width: 'clamp(2rem, 3%, 2.5rem)'}}
                >
                    <ChevronLeftIcon className="w-1/2 h-1/2"/>
                </button>
            )}

            <div
                ref={containerRef}
                className={containerClasses}
                style={{
                    gap: `${gap}px`,
                    scrollbarGutter: manualScroll ? "stable" : "auto",
                    msOverflowStyle: manualScroll ? "none" : "auto",
                    WebkitOverflowScrolling: "touch",
                } as React.CSSProperties}
                onWheel={blockScroll}
                onTouchMove={blockScroll}
                onScroll={manualScroll ? undefined : blockScroll}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0"
                        style={{
                            width: `calc((100% - ${gap * (visibleCount - 1)}px) / ${visibleCount})`,
                        }}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}

                {/* 👇 Nút Explore ở cuối */}
                {showExplore && (
                    <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{
                            width: `calc((100% - ${gap * (visibleCount - 1)}px) / ${visibleCount})`,
                        }}
                    >
                        <button
                            onClick={onExploreClick}
                            className="btn btn-soft"
                        >
                            {exploreLabel}
                        </button>
                    </div>
                )}
            </div>

            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full
                          bg-white text-gray-900 transition-all duration-300 ease-out
                          opacity-0 translate-x-[50%] group-hover:opacity-100 group-hover:-translate-x-[-50%]
                          pointer-events-auto cursor-pointer aspect-square flex items-center justify-center shadow-md"
                    style={{width: 'clamp(2rem, 3%, 2.5rem)'}}
                >
                    <ChevronRightIcon className="w-1/2 h-1/2"/>
                </button>
            )}
        </div>
    );
};
