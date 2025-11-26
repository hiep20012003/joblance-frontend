import {ORDER_ROUTES_REGEX, SELLER_ROUTES_REGEX} from "@/lib/constants/routes";
import {ApiError, FetchApiError} from "@/lib/utils/api";
import {appConfig} from '@/lib/hooks/useConfig'

export function toSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/&/g, 'and')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function fromSlug(slug: string) {
    try {
        return slug
            .replace(/\band\b/g, '&')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    } catch {
        return slug;
    }
}

export function capitalizeWords(str: string, locale = undefined) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toLocaleUpperCase(locale) + word.slice(1))
        .join(" ");
}

export const parseNumber = (val: unknown) => {
    const n = Number(val);
    return isNaN(n) ? val : n;
};

export function parseArray<T = unknown>(input: unknown): T[] {
    let arr: unknown[] = [];

    // Nếu input là string JSON
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input) as [];
            arr = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            arr = [];
        }
    } else if (Array.isArray(input)) {
        arr = input;
    }

    // Parse từng item nếu là string JSON
    return arr.map(item => {
        if (typeof item === 'string') {
            return parseObject<T>(item);
        }
        return item;
    }) as T[];
}


export function parseObject<T = unknown>(input: unknown): T {
    if (typeof input === 'string') {
        try {
            return JSON.parse(input) as T;
        } catch {
            return input as T;
        }
    }

    return input as T;
}

export function parseFetchError(err: unknown): { status: number; data: ApiError } {
    if (err instanceof FetchApiError) {
        const status = err.statusCode || 500;
        const data = err || {message: "Resend failed"};
        return {status, data};
    }

    return {
        status: 500,
        data: {message: "Resend failed due to unexpected error", statusCode: 500, reasonPhrase: 'Internal Server Error'}
    };
}


export function isSellerPath(pathname: string) {
    return SELLER_ROUTES_REGEX.some((regex) => regex.test(pathname));
}

export function isOrderPath(pathname: string) {
    return ORDER_ROUTES_REGEX.some((regex) => regex.test(pathname));
}

export function formatPrice(price: number) {
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price / 100);

    return formatted.replace(/\.00$/, "");
}


export function isValidUrl(url: string): boolean {
    try {
        new URL(url, appConfig.BASE_URL);
        return true;
    } catch {
        return false;
    }
}

export function buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query.append(key, String(value));
        }
    });

    return query.toString();
}

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};


export const selectRandomItem = <T>(arr: T[]): T => {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
};
