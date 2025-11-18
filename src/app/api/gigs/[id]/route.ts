import {NextRequest, NextResponse} from "next/server";
import {ApiResponse, handleApiResponse} from "@/lib/utils/api";

export async function PATCH(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const cookieHeader = req.headers.get("cookie") ?? '';
        const formData = await req.formData();

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/gigs/${id}`, {
            method: 'PATCH',
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

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/gigs/${id}`, {
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

export async function DELETE(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const cookieHeader = req.headers.get("cookie") ?? '';

        const response = await fetch(`${process.env.GATEWAY_URL}/api/v1/gigs/${id}`, {
            method: 'DELETE',
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