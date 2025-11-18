"use client";

import {OlHTMLAttributes, useRef, useState, useEffect} from "react";
import clsx from "clsx";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";

interface NavbarProps extends OlHTMLAttributes<HTMLOListElement> {
    gap?: number;
    zIndex?: number; // thêm prop zIndex
}

export default function Navbar({children, className, gap = 2, zIndex = 10}: NavbarProps) {
    const scrollRef = useRef<HTMLOListElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const tolerance = 2;
        setCanScrollLeft(el.scrollLeft > tolerance);

        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        setCanScrollRight(el.scrollLeft < maxScrollLeft - tolerance);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const offset = 200;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -offset : offset,
                behavior: "smooth",
            });
        }
    };

    return (
        <nav className={clsx("relative", className)}>
            {canScrollLeft && (
                <div
                    className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent pointer-events-none"
                    style={{zIndex}}
                />
            )}

            {canScrollLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background shadow rounded-full p-1"
                    style={{zIndex: zIndex + 1}} // nút trên overlay
                >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-700"/>
                </button>
            )}

            <ol
                ref={scrollRef}
                className={clsx(
                    "flex items-stretch snap-x snap-mandatory scroll-smooth",
                    `gap-${gap}`,
                    canScrollLeft || canScrollRight
                        ? `overflow-x-auto scrollbar-hide justify-start gap-${gap}`
                        : `overflow-hidden justify-between gap-${gap}`
                )}
            >
                {children}
            </ol>

            {canScrollRight && (
                <div
                    className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"
                    style={{zIndex}}
                />
            )}

            {canScrollRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background shadow rounded-full p-1"
                    style={{zIndex: zIndex + 1}}
                >
                    <ChevronRightIcon className="w-5 h-5 text-gray-700"/>
                </button>
            )}
        </nav>
    );
}
