import NextAuth, {CredentialsSignin} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {IAuthDocument} from "@/types/auth";
import type {
    User,
    UserObject,
    AuthValidity,
    Session
} from "next-auth";
import {JWT} from "next-auth/jwt";
import {setCookies} from "@/lib/utils/cookie";
import {ApiError} from "@/lib/utils/api";

// -------------------------
// Custom error class
// -------------------------
class InvalidLoginError extends CredentialsSignin {
    code = JSON.stringify({message: "Sign in failed. Please try again."});

    constructor(code: ApiError) {
        super(code.message);
        this.code = JSON.stringify(code);
    }
}

// -------------------------
// Main Auth config
// -------------------------
export const {handlers, signIn, signOut, auth, unstable_update} = NextAuth({
    providers: [
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
                browserName: {label: "Browser Name", type: "text"},
                deviceType: {label: "Device Type", type: "text"},
            },
            async authorize(credentials) {
                if (!credentials) return null;
                try {
                    // 1️⃣ Gửi yêu cầu đăng nhập đến gateway
                    const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/login`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(credentials),
                    });

                    const authCookies = response.headers.getSetCookie?.();

                    const data = await response.json();
                    if (!response.ok) throw new InvalidLoginError(data);

                    const authUser = data.user as IAuthDocument;
                    await setCookies(authCookies);

                    if (!authUser?.id) return null;

                    // 5️⃣ Trả về cho Auth.js
                    return {
                        id: authUser.id,
                        user: {...authUser, emailVerified: null},
                        authCookies,
                        validity: {
                            validUntil: data.accessTokenExp ?? 0,
                            refreshUntil: data.refreshTokenExp ?? 0,
                        },
                    } as User;
                } catch (error) {
                    if (error instanceof InvalidLoginError) throw error;

                    const err: ApiError = {
                        message: "Sign in failed. Please try again.",
                        statusCode: 400,
                        reasonPhrase: "Sign in failed",
                        errorCode: "LOGIN_FAILED",
                    };
                    throw new InvalidLoginError(err);
                }
            },
        }),
    ],

    pages: {
        signIn: "/login",
    },

    session: {strategy: "jwt"},

    callbacks: {
        async jwt({token, user, account, trigger, session}) {
            // 1. Xử lý update (nếu có)
            if (trigger === 'update') {
                if (session) {
                    // Nếu là update từ client/session, cập nhật token.data và trạng thái refresh
                    return {
                        ...token,
                        data: session,
                        // Quan trọng: Nếu session không gửi needsRefresh, thì mặc định là false
                        needsRefresh: session.needsRefresh ?? false
                    };
                }
            }

            // 2. Xử lý đăng nhập ban đầu
            if (account?.provider === "credentials" && user) {
                console.debug("Initial signing");
                // Đặt needsRefresh = false sau lần đăng nhập đầu tiên
                return {...token, data: user, needsRefresh: false};
            }
            //
            // // 4. Kiểm tra access token còn hạn
            // if (Date.now() < token.data.validity.validUntil * 1000 - 10000) { // Thêm buffer 10s
            //     console.debug("Access token is still valid");
            //     return token;
            // }
            //
            //
            // // 5. Kiểm tra refresh token còn hạn và gọi refreshAccessToken
            // if (Date.now() < token.data.validity.refreshUntil * 1000 - 10000) { // Thêm buffer 10s
            //     console.debug("Refreshing token...");
            //     // Hàm refreshAccessToken sẽ trả về token với needsRefresh: true
            //     // Lần gọi jwt tiếp theo sẽ bị chặn ở bước 3.
            //     return await refreshAccessToken(token);
            // }
            //
            //
            // // 6. Cả hai token đã hết hạn
            // console.debug("Both tokens have expired");
            return {...token} as JWT;
        },

        // -------------------------
        // 2️⃣ Session callback
        // -------------------------
        async session({session, token}) {
            session.user = token.data.user as typeof session.user;
            session.validity = token.data.validity;
            session.error = token.error;
            session.authCookies = token.data.authCookies;
            session.needsRefresh = Boolean(token.needsRefresh);
            return session;
        },

        // async authorized({auth}) {
        //     const
        //     return !!auth?.user;
        // }
    },

    debug: false,
});
