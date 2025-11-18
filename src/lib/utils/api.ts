import {NextResponse} from "next/server";

/* ------------------ Interfaces ------------------ */
export interface ApiError {
    message: string;
    statusCode: number;
    reasonPhrase: string;
    error?: unknown;
    errorCode?: string | number;
}

export interface ApiResponse<T = Record<string, unknown>> {
    message: string;
    statusCode: number;
    reasonPhrase: string;
    metadata?: T;
    errors?: unknown[];
    error?: unknown;
    errorCode?: string;
}

/* ------------------ Error Class ------------------ */
export class FetchApiError<T = unknown> extends Error implements ApiError {
    statusCode: number;
    reasonPhrase: string;
    error?: T;
    errorCode?: string | number;

    constructor(
        message: string,
        statusCode: number,
        reasonPhrase: string,
        error?: T,
        errorCode?: string | number
    ) {
        super(message);
        this.name = "FetchApiError";
        this.statusCode = statusCode;
        this.reasonPhrase = reasonPhrase;
        this.error = error;
        this.errorCode = errorCode;
    }
}

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

async function processQueue() {
    while (refreshQueue.length > 0) {
        const next = refreshQueue.shift();
        if (next) next();
    }
}

export async function fetchApi<T = Record<string, unknown>>(
    url: string,
    options?: RequestInit,
): Promise<T> {
    const isServer = typeof window === "undefined";

    const {cookies} = await import("next/headers");
    const cookieHeader = isServer
        ? (await cookies()).getAll().map((c) => `${c.name}=${c.value}`).join("; ")
        : undefined;

    const baseUrl = isServer
        ? process.env.INTERNAL_API_URL || "http://localhost:3000/api"
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api`;

    const fullUrl = `${baseUrl}${url}`;

    const makeRequest = async () => {
        const headers: HeadersInit = {
            ...options?.headers,
            ...(cookieHeader ? {Cookie: cookieHeader} : {}),
        };

        return fetch(fullUrl, {
            ...options,
            headers,
            credentials: "include",
        });
    };

    let response = await makeRequest();
    let data: any;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    // xử lý 401 bằng processQueue
    if (response.status === 401 && !isServer && !url.includes("logout")) {
        if (isRefreshing) {
            // đợi đến khi refresh xong
            await new Promise<void>((resolve) => {
                refreshQueue.push(resolve);
            });
        } else {
            isRefreshing = true;
            const refreshResponse = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
                cache: 'no-store',
            });

            if (refreshResponse.ok) {

                await processQueue();
            } else {
                refreshQueue = [];
                isRefreshing = false;
                throw new FetchApiError(
                    data?.message ?? "Could not fetch API",
                    response.status,
                    response.statusText,
                    data?.error ?? data?.errors,
                    data?.errorCode
                );
            }

            isRefreshing = false;
        }

        // sau khi refresh xong thì gọi lại request
        response = await makeRequest();
        try {
            data = await response.json();
        } catch {
            data = null;
        }
    }

    if (!response.ok) {
        throw new FetchApiError(
            data?.message ?? "Could not fetch API",
            response.status,
            response.statusText,
            data?.error ?? data?.errors,
            data?.errorCode
        );
    }

    return data as T;
}

/* ------------------ Server: handleApiResponse ------------------ */
export async function handleApiResponse(
    response: Response,
    callback?: (nextResponse: NextResponse) => void | Promise<void>
) {
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

    const nextRes = NextResponse.json(data, {status: response.status});
    if (callback) await callback(nextRes);
    return nextRes;
}



