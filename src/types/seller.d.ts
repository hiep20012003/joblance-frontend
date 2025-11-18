import {IRatingCategories} from "@/types/review";

export type SellerType =
    | string
    | string[]
    | number
    | IRatingCategories
    | Date
    | IExperience
    | IExperience[]
    | IEducation
    | IEducation[]
    | ICertificate
    | ICertificate[]
    | ILanguage
    | ILanguage[]
    | null
    | undefined;

export interface ILanguage {
    [key: string]: string | number | undefined;

    _id?: string;
    language: string;
    level: string;
}

export interface IExperience {
    [key: string]: string | number | boolean | undefined;

    _id?: string;
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    description: string;
    currentlyWorkingHere: boolean;
}

export interface IEducation {
    [key: string]: string | number | undefined;

    _id?: string;
    country: string;
    university: string;
    title: string;
    major: string;
    year: number;
}

export interface ICertificate {
    [key: string]: string | number | undefined;

    _id?: string;
    name: string;
    from: string;
    year: number;
}

export interface ISellerDocument {
    [key: string]: unknown;

    _id?: string;

    // From buyer
    username?: string;
    email?: string;
    profilePicture?: string;
    country?: string;

    fullName?: string;
    description?: string;
    oneliner?: string;
    skills: string[];
    ratingsCount?: number;
    ratingSum?: number;
    ratingCategories?: IRatingCategories;
    languages: ILanguage[];
    responseTime?: number;
    recentDelivery?: Date | string;
    experience: IExperience[];
    education: IEducation[];
    socialLinks: string[];
    certificates: ICertificate[];
    ongoingJobs?: number;
    completedJobs?: number;
    cancelledJobs?: number;
    totalEarnings?: number;
    totalGigs?: number;
    paypal?: string; // not needed
    createdAt?: Date | string;
    updateAt?: Date | string
}
