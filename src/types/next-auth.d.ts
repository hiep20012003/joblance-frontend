import type {User} from "next-auth";
import type {IAuthDocument} from "@/types/auth";

declare module "next-auth" {
    /**
     * What user information we expect to be able to extract
     * from our backend response
     */
    export type UserObject = IAuthDocument & {
        emailVerified: Date | null;
    }

    /**
     * Information extracted from our decoded backend tokens so that we don't need to decode them again.\
     * `valid_until` is the time the access token becomes invalid\
     * `refresh_until` is the time the refresh token becomes invalid
     */
    export interface AuthValidity {
        validUntil: number;
        refreshUntil: number;
    }

    /**
     * The returned data from the authorize method
     * This is data we extract from our own backend JWT tokens.
     */
    export interface User {
        user: UserObject;
        validity: AuthValidity;
        authCookies: string[];
    }

    /**
     * Returned by `useSession`, `getSession`, returned by the `session` callback and also the shape
     * received as a prop on the SessionProvider React Context
     */
    export interface Session {
        user: UserObject;
        validity: AuthValidity;
        authCookies: string[];
        error: "RefreshTokenExpired" | "RefreshAccessTokenError";
        needsRefresh: boolean;
    }
}

declare module "next-auth/jwt" {
    /**
     * Returned by the `jwt` callback and `getToken`, when using JWT sessions
     */
    export interface JWT {
        data: User;
        error: "RefreshTokenExpired" | "RefreshAccessTokenError";
    }
}