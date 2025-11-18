import {Metadata} from 'next';
import {XCircle} from 'lucide-react';
import AnimatedSwitcher from '@/components/shared/AnimatedSwitcher';
import ResetPasswordForm from '@/components/features/auth/ResetPasswordForm';
import ForgotPasswordForm from '@/components/features/auth/ForgotPasswordForm';
import {validateResetPasswordToken} from '@/lib/services/client/user.client';
import Link from "next/link";
import {parseFetchError} from "@/lib/utils/helper";

export const metadata: Metadata = {
    title: 'Reset Password | JobLance',
    description: 'Reset your JobLance account password',
};

// URL: /reset-password?view=forgot
interface ResetPasswordPageProps {
    searchParams?: { token?: string; view?: 'notice' | 'valid' | 'forgot' };
}

export default async function ResetPasswordPage({searchParams}: ResetPasswordPageProps) {
    const token = searchParams?.token;
    const requestedView = searchParams?.view;

    let status: 'valid' | 'invalid' = 'invalid';
    let errorMessage: string | null = null;

    if (!token) {
        errorMessage = 'No reset token provided';
    } else {
        try {
            await validateResetPasswordToken(token);
            status = 'valid';
        } catch (err) {
            const {data} = parseFetchError(err);
            errorMessage = data?.message ?? 'Reset token invalid or expired';
        }
    }

    type ViewKey = 'notice' | 'valid' | 'forgot';
    // nếu view được request qua query param là 'forgot', render forgot
    const viewKey: ViewKey =
        requestedView === 'forgot' ? 'forgot' : status === 'valid' ? 'valid' : 'notice';

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-148">
            <AnimatedSwitcher activeKey={viewKey} direction="right" transitionDuration={0.36} className="w-full">
                {viewKey === 'notice' && (
                    <div className="flex flex-col items-center text-center py-12">
                        <XCircle className="w-12 h-12 text-red-600 mb-2"/>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid or expired link</h2>
                        <p className="text-gray-600 mb-6 text-sm">{errorMessage}</p>

                        <Link
                            href="/reset-password?view=forgot"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
                        >
                            Request new link
                        </Link>
                    </div>
                )}

                {viewKey === 'forgot' && <ForgotPasswordForm/>}
                {viewKey === 'valid' && <ResetPasswordForm token={token}/>}
            </AnimatedSwitcher>
        </div>
    );
}

