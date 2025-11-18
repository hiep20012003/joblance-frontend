export interface IRatingCategoryItem {
    value: number;
    count: number;
}

export interface IRatingCategories {
    five: IRatingCategoryItem;
    four: IRatingCategoryItem;
    three: IRatingCategoryItem;
    two: IRatingCategoryItem;
    one: IRatingCategoryItem;
}

export interface IReviewDocument {
    id: string;
    gigId: string;
    reviewerId: string;
    targetId: string;
    targetPicture: string;
    targetUsername: string;
    review: string;
    reviewerPicture: string;
    rating: number;
    orderId: string;
    createdAt: Date | string;
    reviewerUsername: string;
    reviewType: ReviewType;
    reply?: string;

    [key: string]: any;
}