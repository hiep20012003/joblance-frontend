import {Metadata} from 'next';
import AuthForm from "@/components/features/auth/AuthForm";

export const metadata: Metadata = {
    title: 'Login | JobLance',
    description: 'Log in to your JobLance account',
};

export default function LoginPage() {
    return <AuthForm formType="login"/>;
}