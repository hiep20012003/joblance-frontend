import {Metadata} from 'next';
import SellerRegistrationForm from '@/components/features/seller/SellerRegistrationForm';
import Link from "next/link";
import Image from 'next/image';
import {Edit3} from "lucide-react";

export const metadata: Metadata = {
    title: 'Become a Seller',
    description: 'Create your seller profile and showcase your skills',
};

export default async function SellerRegistrationPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* ----------------------------------------------------------- */}
            {/* HEADER */}
            {/* ----------------------------------------------------------- */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-6 flex items-center justify-between py-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/images/logo-brand.webp"
                            alt="Platform Logo"
                            width={100}
                            height={32}
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                    </Link>

                    {/* Title */}
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                            Become a Seller
                        </h1>
                        <p className="text-sm text-gray-500">
                            Showcase your skills and grow your freelance career
                        </p>
                    </div>

                    {/* Back Button */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
                    >
                        <Edit3 className="w-4 h-4"/>
                        Back to Home
                    </Link>
                </div>
            </header>
            <SellerRegistrationForm/>
        </div>
    );
}
