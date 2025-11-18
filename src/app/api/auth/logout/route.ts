import {NextRequest, NextResponse} from "next/server";
import {clearAuthCookies} from "@/lib/utils/cookie";
import {handleApiResponse, ApiResponse} from "@/lib/utils/api";
import {signOut} from "@/auth";

// export function clearAuthCookies(res: NextResponse) {
//     res.cookies.delete("session");
//     res.cookies.delete("session.sig");
//     res.cookies.delete("session");
//     res.cookies.delete("__Secure-next-auth.session-token");
//     res.cookies.delete("refresh_token");
//     res.cookies.delete("access_token");
//     res.cookies.delete("session_id");
//     res.cookies.delete("mode");
// }

export async function POST(req: NextRequest) {
    const cookieHeader = req.headers.get('cookie') ?? '';
    let res: NextResponse

    console.log(cookieHeader);

    try {
        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/logout`, {
            method: 'POST',
            headers: {
                Cookie: decodeURIComponent(cookieHeader),
            },
        });


        // if (!response.ok) {
        //     if (response.status === 401 || response.status === 403) {
        //         const apiResponse: ApiResponse = {
        //             message: "login again",
        //             statusCode: 500,
        //             reasonPhrase: "Internal Server Error",
        //             errorCode: "INTERNAL_SERVER_ERROR",
        //         };
        //         res = NextResponse.json(apiResponse, {status: 500});
        //         clearAuthCookies(res);
        //         return res;
        //     }
        // }
        // await signOut({redirect: false});
        await clearAuthCookies();
        res = await handleApiResponse(response);
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
        await clearAuthCookies();
        // await signOut({redirect: false});
        return res;
    }
}
