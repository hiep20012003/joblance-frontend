import {NextRequest, NextResponse} from "next/server";
import {handleApiResponse, ApiResponse} from "@/lib/utils/api";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {token} = body;

    if (!token) {
        return NextResponse.json({message: "Reset token is required"}, {status: 400});
    }

    try {
        const response = await fetch(
            `${process.env.GATEWAY_URL}/api/v1/tokens/password/validate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

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
