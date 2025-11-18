import {NextFetchEvent, NextRequest, NextResponse} from "next/server";
import {auth} from "@/auth";
import {LOGIN, LOGOUT, PROTECTED_ROUTES} from "@/lib/constants/routes";
import {parse} from "cookie";
import {refreshTokenFromServer} from "@/lib/services/server/auth.server";
import {Session} from "next-auth";
import {ChainableMiddleware} from "@/lib/utils/chain";
import {getCookie} from "cookies-next"; // Assuming ChainableMiddleware is defined

/**
 * Checks if the Access Token is near expiration.
 * @param session The current NextAuth session object.
 * @throws {Error} if the Access Token is expired or near expiration (within 10s buffer).
 */
const verifyTokenValidity = async (session: Session): Promise<void> => {
    // Check if Access Token is valid (using a 10s buffer)
    if (Date.now() + 10000 >= session.validity.validUntil * 1000)
        throw new Error("Access Token is expired or nearing expiration.");
}

/**
 * Calls the token refresh endpoint and updates cookies on the response object.
 * @param res The NextResponse object to attach new cookies to.
 * @returns The updated NextResponse object.
 * @throws {Error} if the refresh token is expired or the refresh failed.
 */
const refreshAccessToken = async (res: NextResponse): Promise<NextResponse> => {
    const refreshResponse = await refreshTokenFromServer();

    if (!refreshResponse.ok) {
        throw new Error("Refresh Token failed or is expired.");
    }

    const cookiesResponse = refreshResponse.headers.getSetCookie();
    if (cookiesResponse && cookiesResponse.length > 0) {
        for (const cookie of cookiesResponse) {
            const parsedCookie = parse(cookie);
            // Get the first key-value pair, which is the cookie name and value
            const [cookieName, cookieValue] = Object.entries(parsedCookie)[0];

            // Set the new cookie on the response
            res.cookies.set({
                name: cookieName,
                value: cookieValue ?? '',
                httpOnly: true,
                path: parsedCookie.path,
                sameSite: 'none',
                secure: true,
            });
        }
    }
    return res;
}

/**
 * Middleware wrapper to enforce authentication, handle token validity,
 * and refresh tokens when needed.
 * @param middleware The next middleware in the chain.
 */
export function withAuth(middleware: ChainableMiddleware) {

    return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
        const {nextUrl} = req;
        const session = await auth();
        const isAuthenticated = !!session?.user;

        // Attach user ID header for server-side use
        if (session?.user)
            res.headers.set("x-user-id", session?.user.id?.toString() ?? '');
        // Start with a new response object (or a copy of a previous one if applicable)
        const isProtectedRoute = (pathname: string) => PROTECTED_ROUTES.some(route => pathname.startsWith(route));
        // console.log('authenticated', isAuthenticated, isProtectedRoute(nextUrl.pathname), nextUrl.pathname);

        /* ------------------ 1. Access Control ------------------ */
        // Redirect to log out if accessing a protected route without authentication
        // if (isProtectedRoute(nextUrl.pathname) && !isAuthenticated) {
        //     return NextResponse.redirect(new URL(LOGOUT, nextUrl));
        // }
        // Redirect to log in if accessing a protected route without authentication
        if (isProtectedRoute(nextUrl.pathname) && !isAuthenticated) {
            return NextResponse.redirect(new URL(`${LOGIN}?source=${nextUrl.pathname}`, nextUrl));
        }

        /* ------------------ 2. Token Refresh/Validation ------------------ */
        if (isProtectedRoute(nextUrl.pathname) && isAuthenticated && session) {
            try {
                // Verify if the current Access Token is still valid
                await verifyTokenValidity(session);
                // console.log('valid');


            } catch (validationError) {
                // Token expired: attempt to refresh
                try {
                    // Attempt to refresh token and update the 'res' object with new cookies
                    res = await refreshAccessToken(res);
                } catch (refreshError) {
                    // Refresh failed (Refresh Token expired): log out user
                    const currentClientPath = getCookie('currentClientPath') ?? '/';

                    console.error("Token refresh failed. Redirecting to logout.", refreshError, validationError);
                    return NextResponse.redirect(new URL(`${LOGOUT}?source=${currentClientPath}`, nextUrl));
                }
                // console.log("Access token refreshed.");
            }
        }

        // Pass the request and the (potentially updated with new cookies/headers) response
        return middleware(req, event, res);
    };
}