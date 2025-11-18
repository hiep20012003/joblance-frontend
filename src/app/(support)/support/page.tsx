'use client';

import React, {useMemo} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {isValidUrl} from "@/lib/utils/helper";

type MessageItem = {
    title: string;
    description: string;
    tone: string;
};

const messages = {
    order: {
        INVALID_STATE: {
            title: 'This order cannot be processed',
            description: 'Your order is no longer valid for payment. It may have already been completed, cancelled, or expired. Please review your order details or contact our support team for assistance.',
            tone: 'blue',
        },
        NOT_FOUND: {
            title: 'Order not found',
            description: 'We couldn’t locate your order. It may have been removed or you may have followed an invalid link.',
            tone: 'purple',
        },
        default: {
            title: 'Order issue detected',
            description: 'There was a problem with your order. Please contact our support team with the order details for further assistance.',
            tone: 'gray',
        },
    },
    account: {
        default: {
            title: 'Account assistance required',
            description: 'If you’re having trouble signing in, updating your profile, or verifying your identity, please reach out to our support team. We’ll help restore access to your account.',
            tone: 'green',
        },
    },
    gig: {
        INVALID_GIG: {
            title: 'Invalid Gig',
            description: 'The gig you are trying to access is invalid or no longer available. It may have been removed, or you may have followed an invalid link.',
            tone: 'orange',
        },
        default: {
            title: 'Service issue reported',
            description: 'There seems to be an issue with a listed gig or freelancer. Please provide details to our support team so we can investigate further.',
            tone: 'orange',
        },
    },
    payment: {
        default: {
            title: 'Payment issue detected',
            description: 'We encountered a payment error. Please try again later or contact support if the problem persists.',
            tone: 'red',
        },
    },
} as const;

const toneClasses: Record<string, { border: string; text: string; button: string }> = {
    blue: {border: 'border-blue-500', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700'},
    purple: {border: 'border-purple-300', text: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700'},
    green: {border: 'border-green-500', text: 'text-green-600', button: 'bg-green-600 hover:bg-green-700'},
    orange: {border: 'border-orange-500', text: 'text-orange-600', button: 'bg-orange-600 hover:bg-orange-700'},
    red: {border: 'border-red-500', text: 'text-red-600', button: 'bg-red-600 hover:bg-red-700'},
    gray: {border: 'border-gray-200', text: 'text-gray-900', button: 'bg-gray-900 hover:bg-gray-800'},
};

export default function SupportPage() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'general';
    const id = searchParams.get('id') || '';
    const reason = searchParams.get('reason') || 'unknown';
    const link = searchParams.get('link') || '/';

    const linkUrl = isValidUrl(link) ? link : '/';

    const message = useMemo<MessageItem>(() => {
        const typeMessages = (messages as Record<string, Record<string, MessageItem>>)[type];
        if (!typeMessages) {
            return {
                title: 'We’re here to help',
                description: 'Something went wrong. Please contact support.',
                tone: 'gray'
            };
        }
        return typeMessages[reason] || typeMessages.default;
    }, [type, reason]);

    const returnLinkLabel = useMemo(() => (linkUrl === '/' ? 'Return to Homepage' : 'Return to Previous Page'), [linkUrl]);

    const tone = toneClasses[message.tone] || toneClasses.gray;

    return (
        <div
            className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 overflow-hidden">
            {/* Background */}
            <Image
                src="/images/auth-background.webp"
                alt="Background"
                fill
                className="absolute inset-0 object-cover brightness-75 z-0"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0"/>

            {/* Logo */}
            <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 cursor-pointer">
                <Image
                    src="/images/logo-brand.webp"
                    alt="JobLance Logo"
                    width={124}
                    height={124}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                />
            </Link>

            {/* Content */}
            <div
                className={`relative z-10 bg-white/90 backdrop-blur-md border-2 rounded-xl shadow-lg p-10 max-w-md w-full text-center ${tone.border}`}>
                <h1 className={`text-2xl font-bold mb-3 ${tone.text}`}>{message.title}</h1>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">{message.description}</p>

                {id && (
                    <p className="text-sm text-gray-500 mb-4">
                        <span className="font-medium text-gray-700">Reference ID:</span> {id}
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    <Link
                        href={linkUrl}
                        className={`w-full py-3 rounded-md font-semibold text-white transition ${tone.button}`}
                    >
                        {returnLinkLabel}
                    </Link>

                    <Link
                        href={`mailto:support@joblance.com?subject=Support Request - ${type.toUpperCase()} - ${id || 'N/A'}&body=Reason: ${reason}`}
                        className="w-full border border-gray-300 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
