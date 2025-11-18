import {NextRequest, NextResponse} from "next/server";
import {ApiResponse, handleApiResponse} from "@/lib/utils/api";

export async function POST(req: NextRequest) {
    try {
        const cookieHeader = req.headers.get('cookie') ?? '';
        const body = await req.json();
        const userId = req.headers.get('x-user-id') ?? '';

        const modifiedBody = {
            ...body,
            excludeSellers: [...body.excludeSellers, userId],
        };

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/gigs/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: decodeURIComponent(cookieHeader),
            },
            body: JSON.stringify(modifiedBody),
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
