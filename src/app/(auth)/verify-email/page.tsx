'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import ResendVerificationEmailForm from '@/components/features/auth/ResendEmailVerificationForm';
import AnimatedSwitcher from '@/components/shared/AnimatedSwitcher';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from "@/lib/services/client/user.client";
import { parseFetchError } from "@/lib/utils/helper";
import Spinner from "@/components/shared/Spinner";

type ViewKey = 'loading' | 'success' | 'notice' | 'form';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [viewKey, setViewKey] = useState<ViewKey>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reason, setReason] = useState<'signup' | 'login' | undefined>(undefined);

    const token = searchParams.get('token');
    const form = searchParams.get('form');
    const urlReason = searchParams.get('reason') as 'signup' | 'login' | null;

    useEffect(() => {
        if (urlReason) {
            setReason(urlReason);
        }

        // Nếu có param form=resend → hiển thị form ngay
        if (form === 'resend') {
            setViewKey('form');
            return;
        }

        // Nếu không có token → hiển thị notice
        if (!token || token.trim() === '') {
            setErrorMessage(
                urlReason === 'signup'
                    ? 'You need to verify your email to complete signup.'
                    : urlReason === 'login'
                        ? 'You must verify your email before logging in.'
                        : 'No verification token provided'
            );
            setViewKey('notice');
            return;
        }

        // Có token → thử verify
        const performVerify = async () => {
            try {
                await verifyEmail(token);
                setViewKey('success');
            } catch (error) {
                const { data } = parseFetchError(error);
                setErrorMessage(data?.message ?? 'Invalid or expired token');
                setViewKey('notice');
            }
        };

        performVerify();
    }, [token, form, urlReason, router]);

    const isInfo = reason === 'signup' || reason === 'login';

    return (
        <div className="relative flex flex-1 justify-center items-center z-10 px-6 lg:px-32">
            <div className="bg-background backdrop-blur-sm rounded-2xl shadow-lg w-160 text-center">
                <AnimatedSwitcher
                    activeKey={viewKey}
                    direction="right"
                    transitionDuration={0.36}
                    className="w-full"
                >
                    {/* LOADING */}
                    {viewKey === 'loading' && (
                        <Spinner/>
                    )}

                    {/* SUCCESS */}
                    {viewKey === 'success' && (
                        <div className="flex flex-col items-center p-10">
                            <CheckCircle className="w-14 h-14 text-green-600 mb-4" />
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                Email Verified Successfully!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Your account has been verified. You can now log in to continue.
                            </p>
                            <Link
                                href="/login"
                                className="w-full py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {/* NOTICE */}
                    {viewKey === 'notice' && (
                        <div className="flex flex-col items-center p-10">
                            {isInfo ? (
                                <Info className="w-14 h-14 text-blue-600 mb-4" />
                            ) : (
                                <XCircle className="w-14 h-14 text-red-600 mb-4" />
                            )}

                            <h1
                                className={`text-2xl font-semibold mb-2 ${
                                    isInfo ? 'text-blue-800' : 'text-red-800'
                                }`}
                            >
                                {reason === 'signup'
                                    ? 'Please verify your email to complete signup'
                                    : reason === 'login'
                                        ? 'You need to verify your email before logging in'
                                        : 'Verification Failed'}
                            </h1>

                            <p className="text-gray-600 mb-6">
                                {errorMessage ?? 'An unexpected error occurred'}
                            </p>

                            <Link
                                href="/verify-email?form=resend"
                                className={`px-6 py-2 rounded-lg text-white transition-all ${
                                    isInfo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                Request verification link
                            </Link>
                        </div>
                    )}

                    {/* FORM RESEND */}
                    {viewKey === 'form' && <ResendVerificationEmailForm />}
                </AnimatedSwitcher>
            </div>
        </div>
    );
}