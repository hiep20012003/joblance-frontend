'use client'

import {FormEvent, useEffect, useState} from 'react';
import Link from 'next/link';
import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import {forgotPassword} from "@/lib/services/client/user.client";
import {useToast} from "@/context/ToastContext";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";

const RESEND_COOLDOWN = 180; // 3 phút

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const {mutate, loading: isLoading} = useFetchMutation(forgotPassword, {
        successMessage: 'Sent request reset password successfully',
        onSuccess: () => {
            setCooldown(RESEND_COOLDOWN);
        },
        onError: ({data}) => {
            if (data.errorCode === "COOLDOWN") {
                const {waitSeconds} = data.error as { waitSeconds: number };
                setCooldown(waitSeconds ?? cooldown);
            }
        }
    });

    // Countdown effect
    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await mutate(email);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center gap-4 py-10 px-8 max-w-148"
        >
            {/* Header */}
            <div className="text-center mb-2 -mt-2">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset password</h2>
                <p className="text-gray-500 text-sm">
                    Enter your email address and we&#39;ll send you a link to reset your password.
                </p>
            </div>

            {/* Email Input */}
            <div className="w-full text-start">
                <FormLabel label="Email Address" htmlFor="email"/>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || cooldown > 0}
                className="btn w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                ) : cooldown > 0 ? (
                    <>Resend in {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}</>
                ) : (
                    <>Reset Password</>
                )}
            </button>

            {/* Link back to Login */}
            <p className="text-center text-gray-600 text-sm">
                Remember your password?{' '}
                <Link
                    href="/login"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                    Sign In
                </Link>
            </p>
        </form>
    );
}
