export interface IAuthDocument {
    id?: string,
    username?: string;
    email?: string;
    isVerified?: boolean;
    status?: string,
    roles?: string[],
    profilePicture?: string,

    [key: string]: any;

}
