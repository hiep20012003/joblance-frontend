import {useMemo} from "react";
import {logInfo} from "@/lib/utils/devLogger"; // Thêm import logger

export const Pagination = {
    DOTS: '...'
};

interface UsePaginationProps {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    siblingCount?: number;
}

export const usePagination = ({
                                  totalCount,
                                  currentPage,
                                  pageSize,
                                  siblingCount = 1
                              }: UsePaginationProps) => {

    const range = (start: number, end: number) => {
        const length = end - start + 1;
        return Array.from({length}, (_, idx) => idx + start);
    };

    return useMemo(() => {
        const totalPageCount = Math.ceil(totalCount / pageSize);

        // Trường hợp ít trang
        if (totalPageCount <= 1) {
            const pages = [1];
            logInfo('Pagination', 'Calculating pagination', {
                totalCount,
                currentPage,
                pageSize,
                siblingCount,
                totalPageCount,
                pages
            });
            return pages;
        }

        const pages: (number | string)[] = [];

        // 1. Luôn thêm trang 1
        pages.push(1);

        // 2. Tính toán vùng 3 trang ở giữa (tối đa)
        const leftSibling = Math.max(currentPage - siblingCount, 2);
        const rightSibling = Math.min(currentPage + siblingCount, totalPageCount - 1);

        const middleStart = Math.max(leftSibling, 2);
        const middleEnd = Math.min(rightSibling, totalPageCount - 1);

        // Thêm DOTS nếu cần ngắt giữa trang 1 và phần giữa
        if (middleStart > 2) {
            pages.push(Pagination.DOTS);
        }

        // Thêm các trang ở giữa
        if (middleStart <= middleEnd) {
            pages.push(...range(middleStart, middleEnd));
        }

        // 3. Chỉ thêm 1 trang cuối nếu > 1
        if (totalPageCount > 1) {
            // Thêm DOTS nếu phần giữa chưa chạm đến gần cuối
            if (middleEnd < totalPageCount - 1) {
                pages.push(Pagination.DOTS);
            }
            pages.push(totalPageCount);
        }

        // Log duy nhất: input + output
        logInfo('Pagination', 'Calculating pagination', {
            totalCount,
            currentPage,
            pageSize,
            siblingCount,
            totalPageCount,
            pages
        });

        return pages;
    }, [totalCount, currentPage, pageSize, siblingCount]);
};