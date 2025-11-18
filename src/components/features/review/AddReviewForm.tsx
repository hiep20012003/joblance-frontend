'use client'

import React, {useState} from 'react';
import FormLabel from '@/components/shared/FormLabel';
import Textarea from '@/components/shared/Textarea';
import {AlertCircle, Star} from "lucide-react";
import {IOrderDocument} from '@/types/order';
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useDirectValidation, ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import {addReviewSchema} from "@/lib/schemas/review.schema";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {addReview} from "@/lib/services/client/review.client";
import {useUserContext} from "@/context/UserContext";
import {useRouter} from "next/navigation";
import Link from "next/link";

interface AddReviewFormProps {
    order: Required<IOrderDocument>;
    // isSeller: boolean;
    onClose?: () => void;
}

export default function AddReviewForm({order, onClose}: AddReviewFormProps) {
    const {user} = useUserContext();
    const router = useRouter();
    const isSeller = user?.id === order.sellerId;

    const [reviewMessage, setReviewMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [formErrors, setFormErrors] = useState<ValidationTreeifyErrors>({});

    const {parse} = useDirectValidation(addReviewSchema);

    const {mutate, loading} = useFetchMutation(
        addReview,
        {
            successMessage: "Review submitted successfully!",
            onSuccess: () => {
                onClose?.();
                // router.refresh();
                router.replace(`/orders/${order._id}/reviews/completed`);
            },
        }
    );

    const getBodyData = () => {
        return {
            orderId: order._id,
            gigId: order.gigId,
            reviewerId: user?.id as string,
            reviewerUsername: user?.username as string,
            reviewerPicture: user?.profilePicture || '',
            targetId: isSeller ? order.buyerId : order.sellerId,
            targetUsername: isSeller ? order.buyerUsername : order.sellerUsername,
            targetPicture: isSeller ? order.buyerPicture : order.sellerPicture,
            review: reviewMessage,
            rating: rating,
            isSeller: isSeller,
            reviewType: isSeller ? 'BUYER' : 'SELLER',
            country: '',
        };
    };

    const validateForm = () => {
        const bodyData = getBodyData();
        const {valid, treeifyError} = parse(bodyData);
        setFormErrors(treeifyError);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        console.log(getBodyData());
        await mutate(getBodyData());
    };

    return (
        <>
            <LoadingWrapper isLoading={loading} fullScreen/>
            <div className="flex-1 overflow-y-auto scrollbar-beautiful max-w-lg">
                <h2 className="text-xl font-semibold mb-4">{isSeller ? "Review Buyer" : "Review Seller"}</h2>
                <div
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm">
                        Your feedback helps improve the community. Please be honest and constructive.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <FormLabel label="Rating" required/>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={24}
                                    className={`cursor-pointer ${
                                        rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                    }`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        {formErrors?.properties?.rating?.errors?.[0] && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.properties.rating.errors[0]}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <FormLabel label="Your Review" required/>
                        <Textarea
                            placeholder="Share your experience..."
                            value={reviewMessage}
                            onChange={(e) => setReviewMessage(e.target.value)}
                            rows={4}
                            maxLength={2000}
                            minLength={10}
                            showCounter
                            error={formErrors?.properties?.review?.errors?.[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter at least 10 characters</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            type="button"
                            href={`/orders/${order._id}`}
                            className="btn bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
