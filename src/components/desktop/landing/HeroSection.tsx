'use client'

import {ChangeEvent, useRef, useState} from "react";
import {CircleX, Play, Search, Pause} from 'lucide-react';
import Link from "next/link";

const topSearch = ['website development', 'logo design', 'video editing', 'programing', 'vibe code'];

export const HeroSection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [searchInput, setSearchInput] = useState('');

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInput.trim()) return;
    };

    const clearInput = () => {
        setSearchInput('');
    };

    const handlePlay = () => {
        if (!isPlaying) {
            videoRef.current?.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    return (
        <section className="hero-section relative w-full h-[480px] sm:h-[560px] lg:h-[680px] overflow-hidden">
            {/* Video background (desktop only) */}
            <video
                ref={videoRef}
                className="hidden lg:block absolute inset-0 w-full h-full object-cover"
                preload="none"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/videos/slider-landing.webm" type="video/webm"/>
                Your browser does not support the video tag.
            </video>

            {/* Fallback background (mobile/tablet) */}
            <div className="lg:hidden bg-primary-200 absolute inset-0 w-full h-full"/>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"/>

            {/* Content */}
            <div className="relative z-10 container mx-auto flex flex-col justify-center h-full gap-6 px-4">
                <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                    <span className={'text-primary-600'}>
                        Lorem ipsum dolor
                    </span>
                    <br className="hidden sm:block"/> sit amet consectetur elit.
                </h1>

                {/* Search form */}
                <div className="w-full lg:w-2/3">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-row border-0 outline-0 p-1 bg-background rounded-lg shadow-lg w-full focus-within:shadow-[1px_1px_4px_0px_rgba(255,255,255,0.5)]"
                    >
                        <div className="relative w-full">
                            <input
                                value={searchInput}
                                onChange={handleOnChange}
                                type="text"
                                placeholder="What service are you looking for today?"
                                className="w-full h-full inline-block px-4 outline-none bg-background text-sm sm:text-base"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={clearInput}
                                    className="btn p-0 absolute right-3 top-1/2 -translate-y-1/2 rounded-full flex justify-center items-center bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
                                >
                                    <CircleX size={18}/>
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!searchInput.trim()}
                            className="btn rounded-lg h-10 w-10 sm:h-12 sm:w-12 bg-foreground text-background cursor-pointer disabled:opacity-100"
                        >
                            <Search size={18} className="sm:size-20"/>
                        </button>
                    </form>
                </div>

                {/* Top keywords */}
                <div className="top-keyword">
                    <ol className="flex flex-row gap-3 sm:gap-4 overflow-x-auto scrollbar-hide">
                        {topSearch.map((item, i) => (
                            <li key={i} className="flex-shrink-0">
                                <Link href={''} className="text-white text-sm sm:text-base py-1 px-2 btn btn-outlined">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            {/* Play/Pause button (desktop only) */}
            <button
                className="hidden lg:block absolute right-4 bottom-4 z-10 btn bg-foreground/66 text-background rounded-full p-3"
                onClick={handlePlay}
            >
                {!isPlaying ? <Play size={20}/> : <Pause size={20}/>}
            </button>
        </section>
    );
};
