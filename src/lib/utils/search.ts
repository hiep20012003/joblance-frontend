export interface ParsedFilters {
    keyword: string;
    categories: string[];
    subCategories: string[];
    tags: string[];
    skills: string[];
    priceMin: number;
    priceMax: number;
    expectedDeliveryDays: number;
    paginate: {
        size: number;
        type?: 'forward';
        from?: number;
        search_after?: [number, number];
    };
    sort: {
        by: string;
        order: 'asc' | 'desc';
    };
    excludeSellers: string[],
}

// Helper để map sort key giống trong component
// Helper để map sort key giống trong component
export function mapSortKey(key?: string): string {
    const normalizedKey = key?.toLowerCase();

    switch (normalizedKey) {
        case 'price':
            return 'price';
        case 'best':
            return 'bestSelling';
        case 'newest':
            return 'createdAt';
        default:
            return 'bestSelling';
    }
}

// Hàm chính
export function parseSearchParams(
    searchParams?: { [key: string]: string | undefined }
): ParsedFilters {
    const safeDecode = (value?: string) => (value ? decodeURIComponent(value) : "");

    const toNumber = (value: string | undefined, fallback: number) => {
        const n = Number(value);
        return isNaN(n) ? fallback : n;
    };

    // 🔹 Phân trang cơ bản
    const size = toNumber(searchParams?.limit, 24);
    const page = Math.max(toNumber(searchParams?.page, 1), 1);
    const from = (page - 1) * size;

    return {
        keyword: safeDecode(searchParams?.query),
        categories: searchParams?.cat?.split(",").filter(Boolean) || [],
        subCategories: searchParams?.sub?.split(",").filter(Boolean) || [],
        tags: searchParams?.tag?.split(",").filter(Boolean) || [],
        skills: searchParams?.skill?.split(",").filter(Boolean) || [],
        priceMin: toNumber(searchParams?.min, 0),
        priceMax: toNumber(searchParams?.max, 10000),
        expectedDeliveryDays: toNumber(searchParams?.days, 365),
        excludeSellers: searchParams?.exclude?.split(",").filter(Boolean) || [],

        paginate: {
            size,
            from,
        },

        sort: {
            by: mapSortKey(searchParams?.sort),
            order: (searchParams?.order as "asc" | "desc") || "desc",
        },
    };
}


