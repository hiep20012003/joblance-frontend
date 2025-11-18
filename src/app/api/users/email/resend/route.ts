import {NextRequest, NextResponse} from "next/server";
import {handleApiResponse, ApiResponse} from "@/lib/utils/api";

export async function POST(req: NextRequest) {
    try {
        const {email} = await req.json();

        if (!email) {
            return NextResponse.json({message: "Email is required"}, {status: 400});
        }

        const response = await fetch(
            `${process.env.GATEWAY_URL}/api/v1/tokens/email/resend`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email}),
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
