import React from 'react';
import Link from 'next/link';
import {CheckCircle} from 'lucide-react';

export default async function CompletedReviewPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center ">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-6"/>
                <h1 className="text-2xl font-bold text-gray-800 mb-3">Review Submitted!</h1>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    Thank you for sharing your feedback. Your review helps improve our community and services.
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/search/gigs?query="
                        className="btn bg-primary-600 text-white text-base"
                    >
                        Explore More Gigs
                    </Link>
                    <Link
                        href={`/orders/${id}`}
                        className="btn btn-soft text-gray-800 text-base"
                    >
                        Back to Order
                    </Link>
                </div>
            </div>
        </div>
    );
}
