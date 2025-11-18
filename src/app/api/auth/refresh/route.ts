import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/auth";
import {parse} from "cookie";
import {ApiResponse} from "@/lib/utils/api";
import {updateSession} from "@/lib/services/server/auth.server";

export async function POST(req: NextRequest) {
    const cookieHeader = req.headers.get('cookie') ?? ''
    let res: NextResponse;

    try {
        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/refresh`, {
            method: 'POST',
            headers: {
                Cookie: decodeURIComponent(cookieHeader),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            const apiResponse: ApiResponse = {
                message: data.message || "An error occurred",
                statusCode: response.status,
                reasonPhrase: response.statusText,
                error: data.error ?? data.errors,
                errorCode: data.errorCode as string,
            };
            return NextResponse.json(apiResponse, {status: response.status});
        }

        const res = NextResponse.json(data, {status: response.status});
        const rawCookies = response.headers.getSetCookie?.() ?? [];

        if (rawCookies.length > 0) {
            for (const rawCookie of rawCookies) {
                const parsed = parse(rawCookie);
                const [name, value] = Object.entries(parsed)[0] as [string, string];

                const maxAge = parsed["Max-Age"] ? parseInt(parsed["Max-Age"]) : undefined;
                const expires = parsed["Expires"] ? new Date(parsed["Expires"]) : undefined;

                res.cookies.set({
                    name,
                    value,
                    httpOnly: rawCookie.toLowerCase().includes("httponly"),
                    secure: true,
                    sameSite: "none",
                    path: "/",
                    maxAge,
                    expires,
                });
            }
        }

        const session = await auth();
        if (session) {
            await updateSession({
                session: {
                    ...session,
                    user: data.user,
                    validity: {
                        validUntil: data.accessTokenExp ?? 0,
                        refreshUntil: data.accessTokenExp ?? 0,
                    }
                }
            });
        }

        return res;
    } catch (err) {
        const apiResponse: ApiResponse = {
            message: (err as Error).message || "Internal Server Error",
            statusCode: 500,
            reasonPhrase: "Internal Server Error",
            error: err,
            errorCode: "INTERNAL_SERVER_ERROR",
        };
        res = NextResponse.json(apiResponse, {status: 500});
        // await clearAuthCookies();
        // await signOut({redirect: false});
        return res;
    }
}
