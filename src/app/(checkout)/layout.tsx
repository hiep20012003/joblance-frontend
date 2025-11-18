import {ReactNode} from "react";
import {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "JobLance - Connect Freelancers & Clients",
    description: "Vietnam’s leading platform connecting freelancers and clients",
    keywords: ["freelance", "jobs", "services", "JobLance"],
    authors: [{name: "JobLance Team"}],
};


export default function CheckoutLayout({children}: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className={"border-b border-gray-200 shadow-xs"}>
                <div className="flex items-center justify-between container mx-auto px-6 py-1">
                    <Link href="/" className="logo mt-2">
                        <Image
                            src="/images/logo-brand.webp"
                            alt="Logo"
                            width={120}
                            height={68}
                            style={{height: 'auto'}}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                    </Link>
                </div>
            </header>
            <main className="grid grid-cols-1">
                <div className="container mx-auto px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
