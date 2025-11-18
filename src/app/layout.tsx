import "./globals.css";
import 'react-tooltip/dist/react-tooltip.css'
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import AppProvider from "@/context/AppProvider";
import {auth} from "@/auth";
import {IAuthDocument} from "@/types/auth";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: {
            default: "Joblance – Empowering Freelancers and Businesses",
            template: "%s | Joblance",
        },
        description:
            "Joblance connects talented freelancers with clients worldwide. Build your career, hire professionals, and grow together.",
        keywords: [
            "freelance jobs",
            "remote work",
            "hire freelancers",
            "find projects",
            "Joblance",
        ],
        authors: [{name: "Joblance Team"}],
        openGraph: {
            title: "Joblance – Find Freelance Jobs and Hire Experts",
            description:
                "Join Joblance today to connect with global talent and get your projects done efficiently.",
            url: "https://joblance.com",
            siteName: "Joblance",
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: "Joblance – Freelance Marketplace",
            description:
                "Discover projects, collaborate with clients, and grow your freelance business with Joblance.",
        },
        icons: {
            icon: "/favicon.ico",
        },
    };
}

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
                                             children: React.ReactNode;
                                         }>
) {
    const session = await auth();
    const user = session?.user ?? null;
    if (session && session?.error) {
        console.debug('Not authenticated');
        // return null;
    }

    return (
        <html>
        <body
            className={`
                ${geistSans.variable} ${geistMono.variable}
                antialiased h-screen flex flex-col
              `}
        >
        <AppProvider initialUser={user as IAuthDocument}>
            {children}
        </AppProvider>
        </body>

        </html>
    );
}
