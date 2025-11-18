import Image from "next/image";
import Link from "next/link";
import {ReactNode} from "react";
import {cookies} from "next/headers";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

const COLORS: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
};

export default async function AuthLayout({children}: { children: ReactNode }) {
    const cookieStore = await cookies();
    const currentPathname = cookieStore.get('currentClientPath');
    const session = await auth();

    if (session?.user?.id) {
        redirect('/')
    }

    const showBranding = ["/login", "/register"].includes(currentPathname?.value as string);

    return (
        <div
            className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 overflow-hidden">
            {/* Background image */}
            <Image
                src="/images/auth-background.webp"
                alt="Login illustration"
                fill
                style={{objectFit: 'cover'}}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                className="absolute inset-0 object-cover brightness-75 z-0"
            />

            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0"></div>

            {/* Logo */}
            <Link href="/">
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2 cursor-pointer">
                    <Image
                        src="/images/logo-brand.webp"
                        alt="JobLance Logo"
                        width={124}
                        height={124}
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                    />
                </div>
            </Link>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-6xl flex items-center justify-center gap-12">
                {/* Left side - Branding */}
                {showBranding && (
                    <div className="hidden lg:flex flex-col gap-6 flex-1 text-gray-900">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold">Welcome to JobLance</h1>
                            <p className="text-lg text-gray-700">
                                Vietnam’s leading platform connecting freelancers and clients
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                {color: "blue", title: "1000+ Services", desc: "Diverse professional fields"},
                                {color: "green", title: "Secure Payments", desc: "100% transaction protection"},
                                {color: "purple", title: "24/7 Support", desc: "Dedicated customer care team"},
                            ].map(({color, title, desc}) => (
                                <div key={title} className="flex items-start gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${COLORS[color]}`}>
                                        <span className="font-bold text-lg">✓</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{title}</h3>
                                        <p className="text-sm text-gray-700">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right side - Auth Form */}
                <div className="flex-1 flex justify-center items-center max-w-lg relative z-10 rounded-xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
