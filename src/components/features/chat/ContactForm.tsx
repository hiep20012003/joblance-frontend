'use client'

import React, {useCallback, useState} from 'react'
import Avatar from '@/components/shared/Avatar'
import FormLabel from '@/components/shared/FormLabel'
import Textarea from '@/components/shared/Textarea'
import {Send, Sparkles, ArrowRight} from 'lucide-react'
import {useUserContext, useUserStore} from "@/context/UserContext";
import {MessageType} from "@/lib/constants/constant";
import {useDirectValidation} from "@/lib/hooks/useValidation";
import {createConversationSchema} from "@/lib/schemas/chat.schema";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {createConversation} from "@/lib/services/client/chat.client";
import {useRouter} from "next/navigation";

interface ContactFormProps {
    placeholder?: string
    receiverId?: string
    username: string
    profilePicture?: string
    isSeller: boolean
    gigTitle?: string
    onSubmitAction?: (message: string) => void
    onCancelAction?: () => void
}

export default function ContactForm({
                                        profilePicture,
                                        receiverId,
                                        username,
                                        placeholder,
                                        isSeller,
                                        gigTitle,
                                        onCancelAction,
                                        onSubmitAction,
                                    }: ContactFormProps) {
    const [message, setMessage] = useState('');
    const {user} = useUserContext()

    const {parse} = useDirectValidation(createConversationSchema);
    const router = useRouter();

    // Fiverr-style quick questions
    const quickQuestions = isSeller
        ? [
            `Hi ${username}, when can you start working on this?`,
            `Could you share some examples of similar work you've done?`,
            `What information do you need from me to get started?`,
            `Is the price listed final, or can we negotiate?`,
        ]
        : [
            `Hi ${username}, I'm interested in your "${gigTitle || 'gig'}". Could you tell me more?`,
            `How long will it take to complete this project?`,
            `Can you customize the gig for my specific needs?`,
            `Do you offer revisions if I'm not satisfied?`,
        ]

    const defaultPlaceholder = isSeller
        ? `Hi ${username}, I received your order. Let's discuss the details...`
        : `Hi ${username}, I'm interested in your "${gigTitle || 'service'}". Could you please...`

    const handleQuickQuestion = (question: string) => {
        setMessage(question)
    }

    const {mutate, loading} = useFetchMutation(
        createConversation,
        {
            successMessage: "Send message successfully.",
            onSuccess: () => {
                onSubmitAction?.(message)
                onCancelAction?.();
            },
        }
    );

    const getFormData = useCallback(() => {
        console.log(user?.id, receiverId)
        if (!user?.id || !receiverId) return null;

        const formData = new FormData();

        const messageData = {
            senderId: user.id,
            type: MessageType.TEXT,
            content: message.trim(),
        };

        formData.append('message', JSON.stringify(messageData));
        formData.append('participants', user.id);
        formData.append('participants', receiverId);

        return formData;
    }, [message, receiverId, user?.id]);

    const validateFormData = useCallback(() => {
        const formData = getFormData();
        if (!formData) return {valid: false, error: 'Missing sender or receiver.'};

        // Extract data safely
        const participants = formData.getAll('participants') as string[];
        const messageRaw = formData.get('message') as string | null;

        if (!messageRaw) return {valid: false, error: 'Missing message payload.'};

        let messageData;
        try {
            messageData = JSON.parse(messageRaw);
        } catch (err) {
            return {valid: false, error: 'Invalid JSON message.'};
        }

        const {valid, treeifyError} = parse({participants, message: messageData});
        console.log(valid, treeifyError);

        return {valid, formData, treeifyError};
    }, [getFormData, parse]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const {valid, formData, treeifyError} = validateFormData();
        if (!valid) return;
        await mutate(formData);
    }

    return (
        <LoadingWrapper isLoading={loading} fullScreen={true}
                        className="flex-1 overflow-y-auto scrollbar-beautiful p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary-600"/>
                    {isSeller ? 'Contact Your Buyer' : 'Contact the Seller'}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                    Start a conversation to get your project moving
                </p>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Avatar
                    src={profilePicture}
                    username={username}
                    size={56}
                    className="border-2 border-primary-500 shadow-md"
                />
                <div>
                    <p className="font-bold text-lg text-gray-900">{username}</p>
                    <p className="text-sm text-gray-600">
                        {isSeller ? 'Your buyer' : 'Service provider'}
                    </p>
                    {gigTitle && !isSeller && (
                        <p className="text-sm font-medium text-primary-600 mt-1 line-clamp-1">
                            &#34;{gigTitle}&#34;
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Questions - Fiverr Style */}
            {!isSeller && (
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-600"/>
                        Suggested questions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickQuestion(q)}
                                className="text-left p-3 rounded-lg border border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all text-sm text-gray-700 hover:shadow-sm group cursor-pointer"
                            >
                                <span className="line-clamp-2">{q}</span>
                                <ArrowRight
                                    className="w-4 h-4 inline-block ml-2 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Message Form */}
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <FormLabel
                        label="Your message"
                        required
                        className="text-base font-medium"
                    />
                    <Textarea
                        required
                        placeholder={placeholder ?? defaultPlaceholder}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        maxLength={2000}
                        showCounter
                        className="mt-2 resize-none"
                    />

                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancelAction}
                        className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
                    >
                        <Send className="w-4 h-4"/>
                        Send Message
                    </button>
                </div>
            </form>

            {/* Footer Hint */}
            <div className="mt-6 text-center text-xs text-gray-500">
                <p className="text-xs text-gray-500 mt-2">
                    Pro tip: Be clear about your requirements, timeline, and budget for faster response.
                </p>
            </div>
        </LoadingWrapper>
    )
}