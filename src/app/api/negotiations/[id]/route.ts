import {NextRequest, NextResponse} from "next/server";
import {ApiResponse, handleApiResponse} from "@/lib/utils/api";

export async function GET(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const cookieHeader = req.headers.get("cookie") ?? '';

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/negotiations/${id}`, {
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
