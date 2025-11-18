import {Metadata} from 'next';
import {CheckCircle, XCircle, Info} from 'lucide-react';
import ResendVerificationEmailForm from '@/components/features/auth/ResendEmailVerificationForm';
import AnimatedSwitcher from '@/components/shared/AnimatedSwitcher';
import Link from 'next/link';
import {verifyEmail} from "@/lib/services/client/user.client";
import {parseFetchError} from "@/lib/utils/helper";

export const metadata: Metadata = {
    title: 'Verify Email | JobLance',
    description: 'Verify your JobLance account email',
};

interface VerifyEmailPageProps {
    searchParams?: Promise<{ token?: string; form?: 'resend'; reason?: 'signup' | 'login' }>;
}

export default async function VerifyEmailPage({searchParams}: VerifyEmailPageProps) {
    const params = await searchParams;
    const token = params?.token;
    const form = params?.form;
    const reason = params?.reason;
    // Server-side verify
    let status: 'success' | 'failed' | 'invalid_token' | 'expired_token' = 'failed';
    let errorMessage: string | null = null;

    if (!token || token.trim() === '') {
        errorMessage =
            reason === 'signup'
                ? 'You need to verify your email to complete signup.'
                : reason === 'login'
                    ? 'You must verify your email before logging in.'
                    : 'No verification token provided';
    } else {
        try {
            const result = await verifyEmail(token);
            status = 'success';
        } catch (error) {
            const {status, data} = parseFetchError(error);
            errorMessage = data.message ?? 'An unexpected error occurred';
        }
    }

    // Determine view
    type ViewKey = 'success' | 'notice' | 'form';
    let viewKey: ViewKey;

    if (status === 'success') viewKey = 'success';
    else if (form === 'resend') viewKey = 'form';
    else viewKey = 'notice';

    return (
        <div className="relative flex flex-1 justify-center items-center z-10 px-6 lg:px-32">
            <div className="bg-background backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-160 text-center">
                <AnimatedSwitcher activeKey={viewKey} direction="right" transitionDuration={0.36} className="w-full">
                    {/* SUCCESS */}
                    {viewKey === 'success' && (
                        <div className="flex flex-col items-center p-10">
                            <CheckCircle className="w-14 h-14 text-green-600 mb-4"/>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified Successfully!</h1>
                            <p className="text-gray-600 mb-6">Your account has been verified. You can now log in to
                                continue.</p>
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
                        <div className="flex flex-col items-center py-10">
                            {reason === 'signup' || reason === 'login' ? (
                                <Info className="w-14 h-14 text-blue-600 mb-4"/> // icon nhắc nhở
                            ) : (
                                <XCircle className="w-14 h-14 text-red-600 mb-4"/> // icon lỗi
                            )}

                            <h1
                                className={`text-2xl font-semibold mb-2 ${
                                    reason === 'signup' || reason === 'login'
                                        ? 'text-blue-800'
                                        : 'text-red-800'
                                }`}
                            >
                                {reason === 'signup'
                                    ? 'Please verify your email to complete signup'
                                    : reason === 'login'
                                        ? 'You need to verify your email before logging in'
                                        : 'Verification Failed'}
                            </h1>

                            <p className={`mb-6 ${reason === 'signup' || reason === 'login' ? 'text-gray-700' : 'text-gray-600'}`}>
                                {errorMessage ?? ''}
                            </p>

                            <Link
                                href="/verify-email?form=resend"
                                className={`px-6 py-2 rounded-lg text-white transition-all ${
                                    reason === 'signup' || reason === 'login'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                Request verification link
                            </Link>
                        </div>
                    )}

                    {/* FORM */}
                    {viewKey === 'form' && <ResendVerificationEmailForm/>}
                </AnimatedSwitcher>
            </div>
        </div>
    );
}
