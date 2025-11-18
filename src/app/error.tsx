'use client'

import {useEffect} from "react";

export default function Error({error, reset}: { error: Error, reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold text-red-600">Something went wrong!</h1>
            <p className="mt-4 text-gray-600">{error.message}</p>
            <button
                onClick={() => reset()}
                className="mt-6 px-6 py-3 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
                Try again
            </button>
        </div>
    )
}
