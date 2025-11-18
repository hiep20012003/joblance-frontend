// app/not-found.tsx
'use client'

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center bg-gray-50 px-6">
            {/* Illustration */}
            <div className="relative w-60 h-60 md:w-80 md:h-80 flex-shrink-0">
                <Image
                    src="/images/404.webp"
                    alt="Page not found illustration"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Text + actions */}
            <div className="md:ml-12 text-center md:text-left max-w-md">
                <h1 className="text-6xl font-extrabold text-foreground">404</h1>
                <h2 className="mt-4 text-2xl font-semibold text-gray-700">
                    Oops! Page not found
                </h2>
                <p className="mt-2 text-gray-500">
                    The page you’re looking for doesn’t exist or has been moved.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
