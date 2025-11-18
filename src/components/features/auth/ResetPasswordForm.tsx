'use client';

import {FormEvent, useState} from 'react';
import {useRouter} from 'next/navigation';
import FormLabel from '@/components/shared/FormLabel';
import PasswordInput from '@/components/shared/PasswordInput';
import {resetPassword} from '@/lib/services/client/user.client';
import {ResetPasswordPayload} from '@/lib/schemas/auth.schema';
import {useValidation} from '@/lib/hooks/useValidation';
import {resetPasswordSchema} from '@/lib/schemas/auth.schema';
import Link from "next/link";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";

export default function ResetPasswordForm({token}: { token?: string }) {
    const router = useRouter();

    const [resetInfo, setResetInfo] = useState<ResetPasswordPayload>({
        token: token ?? '',
        password: '',
        confirmPassword: '',
    });

    const [validate, errors] = useValidation(resetPasswordSchema);

    const {mutate, loading: isLoading} = useFetchMutation(resetPassword, {
        successMessage: 'Reset password successfully. Please login again.',
        onSuccess: () => {
            router.push('/login');
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate(resetInfo)) return;
        await mutate(resetInfo);
    };

    if (!token) {
        return (
            <div className="max-w-sm mx-auto p-10 text-center bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-red-600 mb-2">
                    No reset token provided
                </h2>
                <p className="text-gray-700 mb-6">
                    You need a valid reset link. You can request a new password reset link below.
                </p>
                <Link href="/forgot-password"
                      className={'px-6 py-2 rounded-lg text-white transition-all bg-blue-600 hover:bg-blue-700'}>
                    Request Reset Link
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-10 max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
                <p className="text-gray-500 text-sm">Enter your new password to regain access</p>
            </div>

            {/* New Password */}
            <div className="w-full">
                <FormLabel label="New Password" htmlFor="password"/>
                <PasswordInput
                    id="password"
                    value={resetInfo.password}
                    error={errors.password?.[0]}
                    onChange={(e) => setResetInfo({...resetInfo, password: e.target.value})}
                />
            </div>

            {/* Confirm Password */}
            <div className="w-full">
                <FormLabel label="Confirm Password" htmlFor="confirmPassword"/>
                <PasswordInput
                    id="confirmPassword"
                    value={resetInfo.confirmPassword}
                    error={errors.confirmPassword?.[0]}
                    onChange={(e) => setResetInfo({...resetInfo, confirmPassword: e.target.value})}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="btn w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z"/>
                    </svg>
                ) : (
                    <>Reset Password</>
                )}
            </button>


        </form>
    );
}
