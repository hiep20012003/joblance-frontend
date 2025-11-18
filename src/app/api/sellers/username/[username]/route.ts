import {NextRequest, NextResponse} from "next/server";
import {ApiResponse, handleApiResponse} from "@/lib/utils/api";

export async function GET(req: NextRequest, {params}: { params: Promise<{ username: string }> }) {
    try {
        const cookieHeader = req.headers.get('cookie') ?? '';
        const {username} = await params;

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/sellers/username/${username}`, {
            method: 'GET',
            headers: {
                Cookie: decodeURIComponent(cookieHeader),
            },
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
