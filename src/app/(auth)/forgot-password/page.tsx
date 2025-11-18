// app/(auth)/forgot-password/page.tsx
import {Metadata} from 'next';
import AuthForm from "@/components/features/auth/AuthForm";

export const metadata: Metadata = {
    title: 'Forgot Password | JobLance',
    description: 'Reset your JobLance account password',
};

export default function ForgotPasswordPage() {
    return <AuthForm formType="forgot"/>;
}
