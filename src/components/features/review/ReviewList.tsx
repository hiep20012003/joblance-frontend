import React, {useEffect, useRef, useState} from 'react';
import {ReviewItem} from './ReviewItem';
import Pagination from "@/components/shared/Pagination";
import {IReviewDocument} from "@/types/review";
import {getReviews} from "@/lib/services/client/review.client";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import LoadingWrapper from "@/components/shared/LoadingWrapper";

export interface ReviewListProps {
    totalCount: number;
    pageSize?: number;
    initialPage?: number;
    params: Record<string, unknown>;
}

export const ReviewList: React.FC<ReviewListProps> = ({
                                                          params,
                                                          totalCount,
                                                          pageSize = 20,
                                                          initialPage = 1,
                                                      }) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [reviews, setReviews] = useState<IReviewDocument[]>([] as IReviewDocument[]);
    const listRef = useRef<HTMLDivElement>(null);
    const SCROLL_OFFSET = 100;

    // 1. Thêm useRef để theo dõi việc tải lần đầu
    const isFirstLoad = useRef(true);

    const {mutate, loading} = useFetchMutation(getReviews, {
        disableToast: true,
        onSuccess: (data) => {
            setReviews(data)
        }
    })

    useEffect(() => {
        mutate({page: currentPage, limit: pageSize, ...params})
    }, [currentPage]);

    // 2. Cập nhật useEffect cuộn để bỏ qua lần đầu
    useEffect(() => {
        // Kiểm tra nếu là lần tải đầu tiên
        if (isFirstLoad.current) {
            // Đặt lại thành false sau lần render đầu tiên
            isFirstLoad.current = false;
            // Bỏ qua thao tác cuộn
            return;
        }

        // Thực hiện cuộn khi currentPage thay đổi (từ lần thứ 2 trở đi)
        if (listRef.current) {
            const topPosition = listRef.current.getBoundingClientRect().top;

            const newScrollY = window.scrollY + topPosition - SCROLL_OFFSET;

            window.scrollTo({
                top: newScrollY,
                behavior: 'smooth'
            });
        }
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="review-list" ref={listRef}>
            <LoadingWrapper isLoading={loading} overlayClassName={'bg-white'}>
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No reviews yet.</p>
                ) : (
                    reviews.map((review, i) => (
                        <ReviewItem key={review.review + i} {...review} />
                    ))
                )}
            </LoadingWrapper>

            {totalCount > pageSize && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};