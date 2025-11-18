'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import AnimatedSwitcher from '@/components/shared/AnimatedSwitcher';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from '@/components/features/auth/ForgotPasswordForm';
import {useUserContext} from "@/context/UserContext";

export type FormType = 'login' | 'forgot' | 'signup';

export default function AuthForm({formType = 'login'}: { formType?: FormType }) {
    const searchParams = useSearchParams();


    const [formFlag, setFormFlag] = useState<FormType>(formType);
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    useEffect(() => {
        const urlFormType = searchParams.get('form') as FormType;
        if (urlFormType && ['login', 'forgot', 'signup'].includes(urlFormType)) {
            setFormFlag(urlFormType);
            setDirection(urlFormType === 'login' ? 'left' : 'right');
        }
    }, [searchParams]);

    const renderForm = () => {
        switch (formFlag) {
            case 'login':
                return <LoginForm/>;
            case 'signup':
                return <SignUpForm/>;
            case 'forgot':
                return <ForgotPasswordForm/>;
            default:
                return <LoginForm/>;
        }
    };

    return (
        <div
            className="
        relative bg-background max-w-md
        overflow-hidden shadow-xl rounded-2xl border border-gray-100
        flex justify-center items-center
      "
        >
            <AnimatedSwitcher
                activeKey={formFlag}
                direction={direction}
                className="w-full"
            >
                {renderForm()}
            </AnimatedSwitcher>
        </div>
    );
}