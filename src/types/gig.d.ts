import {IRatingCategories} from "@/types/review";

export interface IGigDocument {
    _id?: string;
    id?: string;
    sellerId: string;
    title: string;
    username: string;
    profilePicture: string;
    email: string;
    description: string;
    active?: boolean;
    categories: string;
    subCategories: string[];
    tags: string[];
    ratingsCount?: number;
    ratingSum?: number;
    ratingCategories?: IRatingCategories;
    expectedDeliveryDays: number;
    basicTitle: string;
    basicDescription: string;
    price: number;
    currency?: string;
    coverImage?: string;
    requirements: IRequirementQuestion[];
    isDeleted?: boolean;
    createdAt?: Date | string;
    deletedAt?: Date | string;
    sortId?: number;
    toJSON?: () => unknown;

    [key: string]: unknown;
}

export interface IRequirementQuestion {
    _id?: string
    question: string;
    hasFile: boolean;
    required: boolean;

    [key: string]: unknown;
}