'use client';

import {CircleX, Search} from "lucide-react";
import {ChangeEvent, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";


export default function HeaderSearchInput() {
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("query") ?? '');
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInput.trim()) return;
        router.push(`/search/gigs?query=${searchInput}&_t=${Date.now()}`);
    };

    const clearInput = () => {
        setSearchInput('');
    };

    return (
        <div className="relative flex-1 w-fit h-fit">
            {/* overlay mờ khi focus */}
            {/*{isFocused && (*/}
            {/*    <ReactPortal>*/}
            {/*        <div*/}
            {/*            className="fixed inset-0 z-10 bg-black/50"*/}
            {/*            onClick={() => setIsFocused(false)}*/}
            {/*        />*/}
            {/*    </ReactPortal>*/}
            {/*)}*/}


            <form
                onSubmit={handleSubmit}
                className="flex flex-row border-0 outline-0 relative z-20"
            >
                <div className="relative min-w-3/5">
                    <input
                        value={searchInput}
                        onChange={handleOnChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        type="text"
                        placeholder="What service are you looking for today?"
                        className="w-full h-12 rounded-l-md px-4 border outline-none border-gray-300 focus:border-foreground"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={clearInput}
                            className="absolute bg-transparent right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:cursor-pointer"
                        >
                            <CircleX size={18}/>
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!searchInput.trim()}
                    className="btn rounded-l-none h-12 w-14 bg-foreground text-background cursor-pointer disabled:opacity-100"
                >
                    <Search/>
                </button>
            </form>
        </div>
    );
}
