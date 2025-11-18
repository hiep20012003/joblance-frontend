import React from 'react';
import {formatISOTime} from "@/lib/utils/time";
import Avatar from "@/components/shared/Avatar";

export interface ReviewItemProps {
    reviewerUsername: string;
    reviewerPicture?: string;
    review: string;
    rating: number; // 1-5
    createdAt: string | Date;
    reply?: string;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
                                                          reviewerUsername,
                                                          reviewerPicture,
                                                          review,
                                                          rating,
                                                          createdAt,
                                                          reply,
                                                      }) => {
    const formattedDate = formatISOTime(createdAt, 'date')

    return (
        <div className="review-item border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
            <div className="review-header flex items-center mb-2 gap-3">
                {reviewerPicture && (
                    <Avatar
                        src={reviewerPicture}
                        username={reviewerUsername}
                        size={28}
                    />
                )}
                <div className={'flex gap-4 justify-center items-center'}>
                    <p className="font-semibold">{reviewerUsername}</p>
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
            </div>

            <div className="review-body mb-2">
                <p>{review}</p>
            </div>

            <div className="review-rating mb-2">
                {Array.from({length: 5}).map((_, i) => (
                    <span key={i} className={i < rating ? 'text-gray-800' : 'text-gray-300'}>
            ★
          </span>
                ))}
            </div>

            {reply && (
                <div className="review-reply mt-2 p-3 bg-gray-100 rounded">
                    <p className="font-medium mb-1">Seller Reply:</p>
                    <p>{reply}</p>
                </div>
            )}
        </div>
    );
};
