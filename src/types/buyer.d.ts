export interface IBuyerDocument {
    _id?: string | null;
    username?: string | null;
    email?: string | null;
    profilePicture?: string | null;
    profilePublicId?: string | null;
    sex?: string | null;
    country?: string | null;
    isSeller?: boolean | null;
    purchasedGigs?: string[] | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
}
