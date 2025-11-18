import {NextRequest, NextResponse} from "next/server";
import {ApiResponse, handleApiResponse} from "@/lib/utils/api";

export async function POST(req: NextRequest) {
    try {
        const cookieHeader = req.headers.get('cookie') ?? '';
        const body = await req.json();

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/negotiations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: decodeURIComponent(cookieHeader),
            },
            body: JSON.stringify(body),
        });

        return handleApiResponse(response);
    } catch (err) {
        const apiResponse: ApiResponse = {
            message: (err as Error).message || "Internal Server Error",
            statusCode: 500,
            reasonPhrase: "Internal Server Error",
            error: err,
            errorCode: "INTERNAL_SERVER_ERROR",
        };
        return NextResponse.json(apiResponse, {status: 500});
    }
}

//
// export async function GET(req: NextRequest) {
//     try {
//         const cookieHeader = req.headers.get('cookie') ?? '';
//         const {searchParams} = req.nextUrl;
//
//         const paramsObj = Object.fromEntries(searchParams.entries());
//         const queryString = buildQueryString(paramsObj);
//
//
//         const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/orders?${queryString}`, {
//             method: 'GET',
//             headers: {
//                 Cookie: decodeURIComponent(cookieHeader),
//             },
//         });
//
//         return handleApiResponse(response);
//     } catch (err) {
//         const apiResponse: ApiResponse = {
//             message: (err as Error).message || "Internal Server Error",
//             statusCode: 500,
//             reasonPhrase: "Internal Server Error",
//             error: err,
//             errorCode: "INTERNAL_SERVER_ERROR",
//         };
//         return NextResponse.json(apiResponse, {status: 500});
//     }
// }
