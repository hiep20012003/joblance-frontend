import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-50 text-gray-700 px-6 py-10 row-start-3 row-end-4">
            <div className="container mx-auto flex flex-col md:flex-row justify-between gap-8">
                {/* Left: Logo + tagline */}
                <div className="flex flex-col gap-4">
                    <Link href="/">
                        <span className="text-2xl font-bold text-foreground">Joblance</span>
                    </Link>
                    <p className="text-sm max-w-xs">
                        Market your skills. Find work. Grow your business with trusted freelance services.
                    </p>
                </div>

                {/* Center: Navigation links */}
                <div className="flex flex-wrap gap-8 text-sm">
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold">Company</h4>
                        <Link href="#"><span>About</span></Link>
                        <Link href="#"><span>Careers</span></Link>
                        <Link href="#"><span>Blog</span></Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold">Support</h4>
                        <Link href="#"><span>Help Center</span></Link>
                        <Link href="#"><span>Terms of Service</span></Link>
                        <Link href="#"><span>Privacy Policy</span></Link>
                    </div>
                </div>

                {/* Right: Social + language */}
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <Link href="#" target="_blank" rel="noopener noreferrer">
                            <span className="sr-only">Twitter</span>
                            <svg className="w-6 h-6" /* svg icon */></svg>
                        </Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer">
                            <span className="sr-only">Facebook</span>
                            <svg className="w-6 h-6"></svg>
                        </Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer">
                            <span className="sr-only">Instagram</span>
                            <svg className="w-6 h-6"></svg>
                        </Link>
                    </div>
                    <p className="text-sm">&copy; {new Date().getFullYear()} Joblance. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
