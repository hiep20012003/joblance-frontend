import {NextRequest, NextResponse} from "next/server";
import {ApiResponse, handleApiResponse} from "@/lib/utils/api";
import {buildQueryString} from "@/lib/utils/helper";

export async function POST(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const cookieHeader = req.headers.get("cookie") ?? '';
        const formData = await req.formData();

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/conversations/${id}/messages`, {
            method: 'POST',
            headers: {
                Cookie: decodeURIComponent(cookieHeader),
            },
            body: formData,
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


export async function GET(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const cookieHeader = req.headers.get("cookie") ?? '';
        const {searchParams} = req.nextUrl;

        const paramsObj = Object.fromEntries(searchParams.entries());
        const queryString = buildQueryString(paramsObj);

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/conversations/${id}/messages?${queryString}`, {
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
