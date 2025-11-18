'use client';

import React, {useCallback, useState, useEffect} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";

interface CarouselProps {
    slides: { content: React.ReactNode; key: string | number }[];
    className?: string;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showDots?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
                                               slides,
                                               className,
                                               autoPlay = false,
                                               autoPlayInterval = 15000,
                                               showDots = true,
                                           }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalSlides = slides.length;

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    const goToSlide = (index: number) => setCurrentIndex(index);

    useEffect(() => {
        if (autoPlay && autoPlayInterval > 0) {
            const intervalId = setInterval(goToNext, autoPlayInterval);
            return () => clearInterval(intervalId);
        }
    }, [autoPlay, autoPlayInterval, goToNext]);

    if (totalSlides === 0) {
        return (
            <div className={`h-64 flex items-center justify-center bg-gray-100 ${className}`}>
                No slides available.
            </div>
        );
    }

    return (
        <div className={`relative w-full overflow-hidden group ${className}`}>
            <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/9 z-[1] pointer-events-none"/>

            <div
                className="w-full transition-transform duration-500 ease-in-out"
                style={{transform: `translateX(-${currentIndex * 100}%)`}}
            >
                {slides.map((slide) => (
                    <div key={slide.key} className="w-full flex-shrink-0 relative z-0">
                        {slide.content}
                    </div>
                ))}
            </div>
            {
                slides.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full
                          bg-white text-gray-900 transition-all duration-500 ease-out
                          opacity-0 -translate-x-[150%] group-hover:opacity-100 group-hover:translate-x-[40%]
                          pointer-events-auto cursor-pointer aspect-square flex items-center justify-center shadow-md"
                            style={{width: 'clamp(2rem, 5%, 3rem)'}}
                        >
                            <ChevronLeftIcon className="w-1/2 h-1/2"/>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={goToNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full
                          bg-white text-gray-900 transition-all duration-500 ease-out
                          opacity-0 translate-x-[150%] group-hover:opacity-100 group-hover:translate-x-[-40%]
                          pointer-events-auto cursor-pointer aspect-square flex items-center justify-center shadow-md"
                            style={{width: 'clamp(2rem, 5%, 3rem)'}}
                        >
                            <ChevronRightIcon className="w-1/2 h-1/2"/>
                        </button>

                        {showDots && (
                            <div
                                className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10 pointer-events-none group-hover:pointer-events-auto"
                            >
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`rounded-full border border-white/60 transition-all duration-300
                                ${currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}
                                aspect-square`}
                                        style={{width: 'clamp(0.2rem, 2%, 0.6rem)'}}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )
            }
        </div>
    );
};

export default Carousel;
