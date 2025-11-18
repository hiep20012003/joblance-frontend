export interface ApiResponse<T> {
    message: string;
    statusCode: number;
    reasonPhrase: string;
    metadata?: T;
    errors?: unknown[];
    error?: unknown;
    errorCode?: string
}

export interface ErrorResponse {
    status: number;
    data: ApiResponse<Record<string, unknown>>
}