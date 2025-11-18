// src/app/(auth)/login/page.tsx
'use client';

import {FormEvent, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import PasswordInput from '@/components/shared/PasswordInput';
import FormLabel from '@/components/shared/FormLabel';
import Input from '@/components/shared/Input';
import {SignInPayload, signInSchema} from '@/lib/schemas/auth.schema';
import {useToast} from '@/context/ToastContext';
import {useValidation} from "@/lib/hooks/useValidation";
import {signIn} from "@/lib/services/client/auth.client";
import Link from "next/link";
import {getSession} from "next-auth/react";
import {IAuthDocument} from "@/types/auth";
import {getCookie} from "cookies-next";
import {useUserContext} from "@/context/UserContext";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const {setUser, setMode} = useUserContext();
    const {addToastByType} = useToast();
    const [validate, errors] = useValidation(signInSchema);

    const [userInfo, setUserInfo] = useState<SignInPayload>({
        email: '',
        password: '',
        browserName: '',
        deviceType: 'browser',
    });
    const [isLoading, setIsLoading] = useState(false);

    // Safe detect device & browser
    useEffect(() => {
        setUserInfo(prev => ({
            ...prev,
            browserName: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Browser',
            deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'browser',
        }));
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate(userInfo)) return;

        setIsLoading(true);

        try {
            await signIn(userInfo);
            const session = await getSession();

            setUser(session?.user as IAuthDocument);
            const currentMode = await getCookie('mode');
            if (currentMode === 'buyer' || currentMode === 'seller') {
                setMode(currentMode);
            }

            addToastByType('Sign in successfully', 'success');
            router.replace('/');
        } catch (err: any) {
            const errorObj = JSON.parse(err.message || '{}');
            if (errorObj.errorCode === 'EMAIL_NOT_VERIFIED') {
                addToastByType('Please verify your email', 'warning');
                router.push("/verify-email?reason=login");
            } else {
                addToastByType(errorObj.message || 'Login failed', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-transparent flex flex-col gap-4 px-8 py-10 min-w-[560px]"
        >
            <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-500 text-sm">Please login to your account</p>
            </div>

            <div className="w-full">
                <FormLabel label="Email Address" htmlFor="email"/>
                <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    error={errors.email?.[0]}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                />
            </div>

            <div className="w-full">
                <FormLabel label="Password" htmlFor="password"/>
                <PasswordInput
                    value={userInfo.password}
                    error={errors.password?.[0]}
                    onChange={(e) => setUserInfo({...userInfo, password: e.target.value})}
                    id="password"
                />
            </div>

            <div className="w-full flex items-center justify-end">
                <Link
                    href={'/forgot-password'}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer"
                >
                    Forgot Password?
                </Link>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="btn w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    strokeWidth="4"/>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Signing in...
                    </>
                ) : (
                    <>
                        Sign In
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                    </>
                )}
            </button>

            <p className="text-center text-gray-600 text-sm">
                Don&#39;t have an account?{' '}
                <Link
                    href={'/register'}
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors cursor-pointer"
                >
                    Sign Up
                </Link>
            </p>
        </form>
    );
}